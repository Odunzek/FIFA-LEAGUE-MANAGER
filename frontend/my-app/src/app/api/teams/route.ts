// app/api/teams/route.ts - Copy this into your teams route file
import { NextRequest, NextResponse } from 'next/server';
import { createTeam, getTeamsByLeague, getLeagueByName } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueName = searchParams.get('league');
    
    if (!leagueName) {
      return NextResponse.json({ error: 'League name is required' }, { status: 400 });
    }

    const league = await getLeagueByName(leagueName);
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    const teams = await getTeamsByLeague(league.id);
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { leagueName, teamName, color } = await request.json();
    
    if (!leagueName || !teamName) {
      return NextResponse.json({ error: 'League name and team name are required' }, { status: 400 });
    }

    const league = await getLeagueByName(leagueName);
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    const team = await createTeam(league.id, teamName.trim(), color || '#3B82F6');
    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    console.error('Error creating team:', error);
    
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json({ error: 'Team name already exists in this league' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}