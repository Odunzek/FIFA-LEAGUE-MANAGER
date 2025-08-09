import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty array for now - client-side localStorage will handle data
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error in leagues API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // For now, just return the received data
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error in leagues POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}