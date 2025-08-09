// lib/membershipUtils.ts
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
import { db } from './firebase';

// WhatsApp Group Member
export interface GroupMember {
  id?: string;
  name: string;
  psnId?: string; // PlayStation Network ID or Gaming ID
  isActive: boolean; // Can be set to false instead of deleting
  joinedDate: Date;
  totalCompetitions: number;
  totalWins: number;
  notes?: string; // Any additional notes about the member
}

// Competition (Tournament or League)
export interface Competition {
  id?: string;
  name: string;
  type: 'tournament' | 'league';
  format: 'champions_league' | 'world_cup' | 'knockout' | 'round_robin';
  status: 'setup' | 'registration' | 'active' | 'completed';
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
  maxParticipants: number;
  selectedMembers: string[]; // Member IDs who are invited/selected
  participants: CompetitionParticipant[]; // Members who actually joined
  createdBy: string; // Admin who created it
  settings: CompetitionSettings;
}

// Participant in a specific competition
export interface CompetitionParticipant {
  memberId: string;
  memberName: string;
  chosenTeam: string; // Team they're playing as (e.g., "Manchester City")
  joinedAt: Date;
  gamesPlayed: number;
  gamesWon: number;
  gamesDrawn: number;
  gamesLost: number;
  goalsScored: number;
  goalsConceded: number;
  points: number;
  position?: number;
  eliminated?: boolean;
}

export interface CompetitionSettings {
  allowSameTeamSelection: boolean;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  autoGenerateFixtures: boolean;
  groupSize?: number; // For tournaments with groups
}

// Match in a competition
export interface CompetitionMatch {
  id?: string;
  competitionId: string;
  round?: string;
  player1Id: string;
  player1Name: string;
  player1Team: string;
  player2Id: string;
  player2Name: string;
  player2Team: string;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  matchDate?: Date;
  played: boolean;
  reportedBy?: string; // Who reported the result
  notes?: string;
}



// Member Management Functions
export const addGroupMember = async (memberData: Omit<GroupMember, 'id' | 'joinedDate' | 'totalCompetitions' | 'totalWins'>): Promise<string> => {
  try {
    // Remove undefined fields to prevent Firestore errors
    const cleanedData = Object.fromEntries(
      Object.entries(memberData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'group_members'), {
      ...cleanedData,
      joinedDate: new Date(),
      totalCompetitions: 0,
      totalWins: 0,
      isActive: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding group member:', error);
    throw error;
  }
};

export const getGroupMembers = async (includeInactive = false): Promise<GroupMember[]> => {
  try {
    const q = includeInactive 
      ? query(collection(db, 'group_members'), orderBy('name', 'asc'))
      : query(collection(db, 'group_members'), where('isActive', '==', true), orderBy('name', 'asc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GroupMember));
  } catch (error) {
    console.error('Error getting group members:', error);
    return [];
  }
};

export const updateGroupMember = async (memberId: string, updates: Partial<GroupMember>): Promise<void> => {
  try {
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    await updateDoc(doc(db, 'group_members', memberId), cleanedUpdates);
  } catch (error) {
    console.error('Error updating group member:', error);
    throw error;
  }
};

export const deactivateGroupMember = async (memberId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'group_members', memberId), { isActive: false });
  } catch (error) {
    console.error('Error deactivating group member:', error);
    throw error;
  }
};

export const deleteGroupMember = async (memberId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'group_members', memberId));
  } catch (error) {
    console.error('Error deleting group member:', error);
    throw error;
  }
};

// Competition Management Functions
export const createCompetition = async (competitionData: Omit<Competition, 'id' | 'createdAt' | 'participants'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'competitions'), {
      ...competitionData,
      createdAt: new Date(),
      participants: [],
      status: 'setup'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating competition:', error);
    throw error;
  }
};

export const getCompetitions = async (): Promise<Competition[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'competitions'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Competition));
  } catch (error) {
    console.error('Error getting competitions:', error);
    return [];
  }
};

export const joinCompetition = async (
  competitionId: string, 
  memberId: string, 
  memberName: string,
  chosenTeam: string
): Promise<void> => {
  try {
    const competitions = await getCompetitions();
    const competition = competitions.find(c => c.id === competitionId);
    
    if (!competition) {
      throw new Error('Competition not found');
    }
    
    if (competition.participants.length >= competition.maxParticipants) {
      throw new Error('Competition is full');
    }
    
    // Check if member already joined
    const alreadyJoined = competition.participants.find(p => p.memberId === memberId);
    if (alreadyJoined) {
      throw new Error('Member already joined this competition');
    }
    
    // Check if team is already taken (if not allowed)
    if (!competition.settings.allowSameTeamSelection) {
      const teamTaken = competition.participants.find(p => p.chosenTeam === chosenTeam);
      if (teamTaken) {
        throw new Error('Team already chosen by another player');
      }
    }
    
    const newParticipant: CompetitionParticipant = {
      memberId,
      memberName,
      chosenTeam,
      joinedAt: new Date(),
      gamesPlayed: 0,
      gamesWon: 0,
      gamesDrawn: 0,
      gamesLost: 0,
      goalsScored: 0,
      goalsConceded: 0,
      points: 0,
      eliminated: false
    };
    
    const updatedParticipants = [...competition.participants, newParticipant];
    
    await updateDoc(doc(db, 'competitions', competitionId), {
      participants: updatedParticipants
    });
    
  } catch (error) {
    console.error('Error joining competition:', error);
    throw error;
  }
};

export const recordCompetitionMatch = async (
  matchId: string,
  player1Score: number,
  player2Score: number,
  reportedBy: string,
  notes?: string
): Promise<void> => {
  try {
    // This would update the specific match and recalculate standings
    // Implementation would be similar to previous tournament system
    
    await updateDoc(doc(db, 'competition_matches', matchId), {
      player1Score,
      player2Score,
      winnerId: player1Score > player2Score ? 'player1' : 
               player2Score > player1Score ? 'player2' : undefined,
      played: true,
      matchDate: new Date(),
      reportedBy,
      notes
    });
    
  } catch (error) {
    console.error('Error recording competition match:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToGroupMembers = (callback: (members: GroupMember[]) => void) => {
  const q = query(
    collection(db, 'group_members'),
    orderBy('name', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GroupMember));
    callback(members);
  });
};

export const subscribeToCompetitions = (callback: (competitions: Competition[]) => void) => {
  const q = query(collection(db, 'competitions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const competitions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Competition));
    callback(competitions);
  });
};

// Utility functions
export const searchMembers = (members: GroupMember[], searchTerm: string): GroupMember[] => {
  return members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.psnId && member.psnId.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};

export const getMemberStats = async (memberId: string): Promise<{
  totalCompetitions: number;
  totalWins: number;
  winRate: number;
}> => {
  try {
    // This would calculate stats across all competitions
    const competitions = await getCompetitions();
    let totalCompetitions = 0;
    let totalWins = 0;
    
    competitions.forEach(competition => {
      const participant = competition.participants.find(p => p.memberId === memberId);
      if (participant) {
        totalCompetitions++;
        if (participant.position === 1) {
          totalWins++;
        }
      }
    });
    
    const winRate = totalCompetitions > 0 ? (totalWins / totalCompetitions) * 100 : 0;
    
    return { totalCompetitions, totalWins, winRate };
  } catch (error) {
    console.error('Error getting member stats:', error);
    return { totalCompetitions: 0, totalWins: 0, winRate: 0 };
  }
};