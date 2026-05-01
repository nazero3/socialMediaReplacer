export interface JsonFetchOptions {
  userAgent: string;
  timeoutMs?: number;
  accept?: string;
}

export async function fetchJson<T>(url: string, opts: JsonFetchOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15_000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': opts.userAgent,
        Accept: opts.accept ?? 'application/json',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchText(url: string, opts: JsonFetchOptions): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15_000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': opts.userAgent,
        Accept: opts.accept ?? 'application/xml,text/xml,application/rss+xml,application/atom+xml,*/*;q=0.5',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}
