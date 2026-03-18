import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, generateReferralCode } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
      referralCode: generateReferralCode(fbUser.uid),
      referredBy: null,
      referralCount: 0,
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
            displayName: data.displayName || fbUser?.displayName || (fbUser?.email ? fbUser.email.split('@')[0] : 'Player'),
            walletBalance: data.walletBalance || 0,
            winningCredits: data.winningCredits || 0,
            isBanned: data.isBanned || false,
            isAdmin: data.isAdmin || false,
            referralCode: data.referralCode || generateReferralCode(uid),
            referredBy: data.referredBy || null,
            referralCount: data.referralCount || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
          return;
        }
        if (fbUser) setUser(buildFallbackUser(fbUser));
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (fbUser) setUser(buildFallbackUser(fbUser));
      } finally {
        setIsLoading(false);
      }
    },
    [buildFallbackUser]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setUser((prev) => prev ?? buildFallbackUser(fbUser));
        setIsLoading(true);
        setTimeout(() => { fetchUserProfile(fbUser.uid, fbUser); }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [buildFallbackUser, fetchUserProfile]);

  useEffect(() => {
    if (!firebaseUser?.uid) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        setUser({
          id: firebaseUser.uid,
          email: data.email || firebaseUser.email || '',
          phone: data.phone || '',
          displayName: data.displayName || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Player'),
          walletBalance: data.walletBalance || 0,
          winningCredits: data.winningCredits || 0,
          isBanned: data.isBanned || false,
          isAdmin: data.isAdmin || false,
          referralCode: data.referralCode || generateReferralCode(firebaseUser.uid),
          referredBy: data.referredBy || null,
          referralCount: data.referralCount || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      },
      (error) => { console.warn('User profile listener error:', error); }
    );
    return () => unsubscribe();
  }, [firebaseUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const newReferralCode = generateReferralCode(credential.user.uid);
      
      const userData: any = {
        email,
        displayName,
        phone: '',
        walletBalance: 0,
        winningCredits: 0,
        isBanned: false,
        isAdmin: false,
        referralCode: newReferralCode,
        referredBy: referralCode || null,
        referralCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', credential.user.uid), userData);
      
      setUser({
        id: credential.user.uid,
        email,
        displayName,
        phone: '',
        walletBalance: 0,
        winningCredits: 0,
        isBanned: false,
        isAdmin: false,
        referralCode: newReferralCode,
        referredBy: referralCode || null,
        referralCount: 0,
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
