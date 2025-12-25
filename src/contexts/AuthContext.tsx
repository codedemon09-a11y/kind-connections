import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buildFallbackUser = useCallback((fbUser: FirebaseUser): User => {
    const email = fbUser.email ?? '';
    const displayName = fbUser.displayName ?? (email ? email.split('@')[0] : 'Player');

    return {
      id: fbUser.uid,
      email,
      phone: '',
      displayName,
      walletBalance: 0,
      winningCredits: 0,
      isBanned: false,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, []);

  const fetchUserProfile = useCallback(
    async (uid: string, fbUser?: FirebaseUser | null) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            id: uid,
            email: data.email || fbUser?.email || '',
            phone: data.phone || '',
            displayName:
              data.displayName || fbUser?.displayName || (fbUser?.email ? fbUser.email.split('@')[0] : 'Player'),
            walletBalance: data.walletBalance || 0,
            winningCredits: data.winningCredits || 0,
            isBanned: data.isBanned || false,
            isAdmin: data.isAdmin || false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
          return;
        }

        // If profile doesn't exist (or can't be read), keep a safe fallback so the UI can still treat the user as logged in.
        if (fbUser) {
          setUser(buildFallbackUser(fbUser));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (fbUser) {
          setUser(buildFallbackUser(fbUser));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [buildFallbackUser]
  );

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // Mark logged-in immediately (don’t wait for Firestore), then hydrate profile.
        setUser((prev) => prev ?? buildFallbackUser(fbUser));
        setIsLoading(true);
        setTimeout(() => {
          fetchUserProfile(fbUser.uid, fbUser);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [buildFallbackUser, fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User profile will be fetched by onAuthStateChanged
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userData = {
        email,
        displayName,
        phone: '',
        walletBalance: 0,
        winningCredits: 0,
        isBanned: false,
        isAdmin: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', credential.user.uid), userData);
      
      // Immediately set the user state after signup (don't wait for onAuthStateChanged)
      setUser({
        id: credential.user.uid,
        email,
        displayName,
        phone: '',
        walletBalance: 0,
        winningCredits: 0,
        isBanned: false,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated: !!firebaseUser,
        isAdmin: user?.isAdmin ?? false,
        login,
        signup,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};