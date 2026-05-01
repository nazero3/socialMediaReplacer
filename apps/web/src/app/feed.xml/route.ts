const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const revalidate = 600;

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/feed.xml`, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(String(res.status));
    const xml = await res.text();
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=600',
      },
    });
  } catch {
    return new Response('<?xml version="1.0"?><feed/>', {
      status: 503,
      headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
    });
  }
}
