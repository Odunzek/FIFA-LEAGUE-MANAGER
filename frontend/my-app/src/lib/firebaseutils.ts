// lib/firebaseUtils.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy 
} from 'firebase/firestore';
import { db, League, Team, Match } from './firebase';

// League Functions
export const createLeague = async (name: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'leagues'), {
      name,
      createdAt: new Date(),
      teams: []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating league:', error);
    throw error;
  }
};

export const getLeagues = async (): Promise<League[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'leagues'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as League));
  } catch (error) {
    console.error('Error getting leagues:', error);
    return [];
  }
};

export const deleteLeague = async (leagueId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'leagues', leagueId));
    
    // Also delete all teams for this league
    const teamsQuery = query(collection(db, 'teams'), where('leagueId', '==', leagueId));
    const teamsSnapshot = await getDocs(teamsQuery);
    
    const deletePromises = teamsSnapshot.docs.map(teamDoc => 
      deleteDoc(doc(db, 'teams', teamDoc.id))
    );
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting league:', error);
    throw error;
  }
};

export const updateLeague = async (leagueId: string, updates: Partial<League>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'leagues', leagueId), updates);
  } catch (error) {
    console.error('Error updating league:', error);
    throw error;
  }
};

// Team Functions
export const createTeam = async (leagueId: string, teamName: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'teams'), {
      leagueId,
      name: teamName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const getTeams = async (leagueId: string): Promise<Team[]> => {
  try {
    const q = query(collection(db, 'teams'), where('leagueId', '==', leagueId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Team));
  } catch (error) {
    console.error('Error getting teams:', error);
    return [];
  }
};

export const updateTeamStats = async (teamId: string, stats: Partial<Team>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId), stats);
  } catch (error) {
    console.error('Error updating team stats:', error);
    throw error;
  }
};

// Match Functions
export const saveMatch = async (match: Omit<Match, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'matches'), {
      ...match,
      date: new Date(match.date)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving match:', error);
    throw error;
  }
};

export const getMatches = async (leagueName: string): Promise<Match[]> => {
  try {
    const q = query(
      collection(db, 'matches'), 
      where('leagueName', '==', leagueName),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Match));
  } catch (error) {
    console.error('Error getting matches:', error);
    return [];
  }
};

// Real-time listeners
export const subscribeToLeagues = (callback: (leagues: League[]) => void) => {
  const q = query(collection(db, 'leagues'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const leagues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as League));
    callback(leagues);
  });
};

export const subscribeToTeams = (leagueId: string, callback: (teams: Team[]) => void) => {
  const q = query(collection(db, 'teams'), where('leagueId', '==', leagueId));
  return onSnapshot(q, (snapshot) => {
    const teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Team));
    callback(teams);
  });
};
export type { League, Team, Match };