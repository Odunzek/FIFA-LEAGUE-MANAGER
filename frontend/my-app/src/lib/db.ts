// lib/db.ts - Copy this entire code into your lib/db.ts file
import { sql } from '@vercel/postgres';

export interface League {
  id: number;
  name: string;
  created_at: string;
}

export interface Team {
  id: number;
  league_id: number;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  color: string;
}

export interface Match {
  id: number;
  league_id: number;
  team1_name: string;
  team2_name: string;
  team1_score: number;
  team2_score: number;
  played_at: string;
}

// League operations
export async function createLeague(name: string): Promise<League> {
  const result = await sql`
    INSERT INTO leagues (name) 
    VALUES (${name}) 
    RETURNING id, name, created_at
  `;
  return result.rows[0] as League;
}

export async function getLeagues(): Promise<League[]> {
  const result = await sql`
    SELECT id, name, created_at 
    FROM leagues 
    ORDER BY created_at DESC
  `;
  return result.rows as League[];
}

export async function deleteLeague(id: number): Promise<void> {
  await sql`DELETE FROM leagues WHERE id = ${id}`;
}

// Team operations
export async function createTeam(leagueId: number, name: string, color: string): Promise<Team> {
  const result = await sql`
    INSERT INTO teams (league_id, name, color) 
    VALUES (${leagueId}, ${name}, ${color}) 
    RETURNING *
  `;
  return result.rows[0] as Team;
}

export async function getTeamsByLeague(leagueId: number): Promise<Team[]> {
  const result = await sql`
    SELECT * FROM teams 
    WHERE league_id = ${leagueId} 
    ORDER BY points DESC, (goals_for - goals_against) DESC, goals_for DESC
  `;
  return result.rows as Team[];
}

export async function updateTeamStats(
  teamName: string, 
  leagueId: number, 
  played: number, 
  won: number, 
  drawn: number, 
  lost: number, 
  goalsFor: number, 
  goalsAgainst: number, 
  points: number
): Promise<void> {
  await sql`
    UPDATE teams 
    SET played = ${played}, won = ${won}, drawn = ${drawn}, lost = ${lost}, 
        goals_for = ${goalsFor}, goals_against = ${goalsAgainst}, points = ${points}
    WHERE name = ${teamName} AND league_id = ${leagueId}
  `;
}

// Match operations
export async function createMatch(
  leagueId: number,
  team1Name: string,
  team2Name: string,
  team1Score: number,
  team2Score: number
): Promise<Match> {
  const result = await sql`
    INSERT INTO matches (league_id, team1_name, team2_name, team1_score, team2_score) 
    VALUES (${leagueId}, ${team1Name}, ${team2Name}, ${team1Score}, ${team2Score}) 
    RETURNING *
  `;
  return result.rows[0] as Match;
}

export async function getMatchesByLeague(leagueId: number): Promise<Match[]> {
  const result = await sql`
    SELECT * FROM matches 
    WHERE league_id = ${leagueId} 
    ORDER BY played_at DESC
  `;
  return result.rows as Match[];
}

// Utility function to get league by name
export async function getLeagueByName(name: string): Promise<League | null> {
  const result = await sql`
    SELECT id, name, created_at 
    FROM leagues 
    WHERE name = ${name}
  `;
  return result.rows[0] as League || null;
}