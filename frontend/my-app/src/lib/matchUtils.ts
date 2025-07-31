import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  addDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

import { Match, Team, League } from './firebase'; // reuse the types you already defined

export async function getLeagueByName(name: string): Promise<League | null> {
  const q = query(collection(db, 'leagues'), where('name', '==', name));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...(docSnap.data() as League) };
}

export async function getTeamsByLeague(leagueId: string): Promise<Team[]> {
  const q = query(collection(db, 'teams'), where('leagueId', '==', leagueId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Team) }));
}

export async function getMatchesByLeague(leagueId: string): Promise<Match[]> {
  const q = query(collection(db, 'matches'), where('leagueId', '==', leagueId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Match) }));
}

export async function createMatch(
  leagueId: string,
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number
): Promise<Match> {
  const newMatch: Match = {
    leagueName: '', // Optional if not used
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    date: new Date(),
  };

  const matchRef = await addDoc(collection(db, 'matches'), {
    ...newMatch,
    leagueId,
    timestamp: Timestamp.now(),
  });

  return { id: matchRef.id, ...newMatch };
}

export async function updateTeamStats(
  teamName: string,
  leagueId: string,
  played: number,
  won: number,
  drawn: number,
  lost: number,
  goalsFor: number,
  goalsAgainst: number,
  points: number
): Promise<void> {
  const q = query(
    collection(db, 'teams'),
    where('name', '==', teamName),
    where('leagueId', '==', leagueId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error('Team not found');

  const teamDoc = snapshot.docs[0];

  await updateDoc(teamDoc.ref, {
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points,
  });
}
