// app/api/matches/route.ts - Copy this into your matches route file
import { NextRequest, NextResponse } from 'next/server';
// import { createMatch, getMatchesByLeague, getLeagueByName, getTeamsByLeague, updateTeamStats } from '@/lib/db';
import { createMatch, getMatchesByLeague, getLeagueByName, getTeamsByLeague, updateTeamStats } from '../../../lib/db';

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

    const matches = await getMatchesByLeague(league.id);
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { leagueName, team1, team2, score1, score2 } = await request.json();
    
    if (!leagueName || !team1 || !team2 || score1 == null || score2 == null) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (team1 === team2) {
      return NextResponse.json({ error: 'A team cannot play against itself' }, { status: 400 });
    }

    const league = await getLeagueByName(leagueName);
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    // Create the match
    const match = await createMatch(league.id, team1, team2, score1, score2);

    // Update team statistics
    const teams = await getTeamsByLeague(league.id);
    const team1Data = teams.find(t => t.name === team1);
    const team2Data = teams.find(t => t.name === team2);

    if (team1Data && team2Data) {
      // Update team1 stats
      const team1IsWin = score1 > score2;
      const team1IsDraw = score1 === score2;
      const team1IsLoss = score1 < score2;

      await updateTeamStats(
        team1,
        league.id,
        team1Data.played + 1,
        team1Data.won + (team1IsWin ? 1 : 0),
        team1Data.drawn + (team1IsDraw ? 1 : 0),
        team1Data.lost + (team1IsLoss ? 1 : 0),
        team1Data.goals_for + score1,
        team1Data.goals_against + score2,
        team1Data.points + (team1IsWin ? 3 : team1IsDraw ? 1 : 0)
      );

      // Update team2 stats
      const team2IsWin = score2 > score1;
      const team2IsDraw = score1 === score2;
      const team2IsLoss = score2 < score1;

      await updateTeamStats(
        team2,
        league.id,
        team2Data.played + 1,
        team2Data.won + (team2IsWin ? 1 : 0),
        team2Data.drawn + (team2IsDraw ? 1 : 0),
        team2Data.lost + (team2IsLoss ? 1 : 0),
        team2Data.goals_for + score2,
        team2Data.goals_against + score1,
        team2Data.points + (team2IsWin ? 3 : team2IsDraw ? 1 : 0)
      );
    }

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
  }
}