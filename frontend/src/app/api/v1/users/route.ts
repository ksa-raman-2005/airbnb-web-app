import { NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';

export async function GET() {
  return NextResponse.json(serverlessStore.users);
}
