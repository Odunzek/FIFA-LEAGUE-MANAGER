// app/api/leagues/route.ts - Copy this into your leagues route file
import { NextRequest, NextResponse } from 'next/server';
import { createLeague, getLeagues, deleteLeague } from '@/lib/db';

export async function GET() {
  try {
    const leagues = await getLeagues();
    return NextResponse.json(leagues);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json({ error: 'Failed to fetch leagues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'League name must be at least 2 characters' }, { status: 400 });
    }

    const league = await createLeague(name.trim());
    return NextResponse.json(league, { status: 201 });
  } catch (error: any) {
    console.error('Error creating league:', error);
    
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json({ error: 'League name already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create league' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    await deleteLeague(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting league:', error);
    return NextResponse.json({ error: 'Failed to delete league' }, { status: 500 });
  }
}