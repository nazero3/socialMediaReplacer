#!/usr/bin/env bash
set -euo pipefail
# Prisma P1013 "scheme is not recognized" usually means the GitHub secret is malformed:
# - pasted as a full .env line (DATABASE_URL=postgresql://...)
# - leading/trailing quotes or spaces
# - password contains @ : # etc. without URL-encoding

strip_wrapping_quotes() {
  local v="$1"
  if [[ ${#v} -ge 2 && ${v:0:1} == '"' && ${v: -1} == '"' ]]; then v="${v:1:-1}"; fi
  if [[ ${#v} -ge 2 && ${v:0:1} == "'" && ${v: -1} == "'" ]]; then v="${v:1:-1}"; fi
  printf '%s' "$v"
}

validate_url() {
  local label="$1"
  local raw="$2"

  raw="${raw#"${raw%%[![:space:]]*}"}"
  raw="${raw%"${raw##*[![:space:]]}"}"
  raw="${raw//$'\xEF\xBB\xBF'/}"

  if [[ -z "$raw" || "$raw" == "undefined" ]]; then
    echo "::error::${label} is empty. Set the matching repository secret (Settings → Secrets and variables → Actions)."
    return 1
  fi

  if [[ "$raw" =~ ^[Dd][Aa][Tt][Aa][Bb][Aa][Ss][Ee]_[Uu][Rr][Ll]= ]]; then
    echo "::error::${label} looks like a full .env line. The secret value must be ONLY the URI (no DATABASE_URL= prefix)."
    return 1
  fi
  if [[ "$raw" =~ ^[Dd][Ii][Rr][Ee][Cc][Tt]_[Uu][Rr][Ll]= ]]; then
    echo "::error::${label} looks like a full .env line. The secret value must be ONLY the URI (no DIRECT_URL= prefix)."
    return 1
  fi

  raw="$(strip_wrapping_quotes "$raw")"

  if [[ ! "$raw" =~ ^postgres(ql)?:// ]]; then
    echo "::error::${label} must start with postgresql:// or postgres:// so Prisma recognizes the scheme. Fix the secret (no spaces before the scheme; if the password has special characters, URL-encode them in the URI)."
    return 1
  fi
}

validate_url 'DATABASE_URL (secret DATABASE_URL)' "${DATABASE_URL:-}"
validate_url 'DIRECT_URL (secret DIRECT_URL or fallback)' "${DIRECT_URL:-}"
