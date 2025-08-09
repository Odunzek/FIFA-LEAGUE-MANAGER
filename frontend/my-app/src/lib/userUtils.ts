// lib/userUtils.ts
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

export interface User {
  id?: string;
  name: string;
  email?: string;
  position?: string;
  team?: string;
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

// User Functions
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: new Date(),
      isActive: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), orderBy('name', 'asc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, 'users'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
    callback(users);
  });
};

// Search users by name or email
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    const users = await getUsers();
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};