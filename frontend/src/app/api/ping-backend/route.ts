import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json({ pinged: true, backend: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ pinged: false, error: err.message }, { status: 503 });
  }
}
