import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as Blob | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const blob = await put(filename, file, { access: 'public' });

  return NextResponse.json({ url: blob.url }, { status: 200 });
}
