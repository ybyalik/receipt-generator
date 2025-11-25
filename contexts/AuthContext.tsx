import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  premiumLoading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [premiumLoading, setPremiumLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Check for cached premium data first (valid for 5 minutes)
        const cacheKey = `premium_${firebaseUser.uid}`;
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
        let cachedData = null;
        
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            // Cache valid for 5 minutes
            if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              cachedData = parsed.data;
            }
          } catch (e) {
            // Invalid cache, ignore
          }
        }

        // If we have valid cached data, use it immediately
        if (cachedData) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isPremium: cachedData.isPremium || false,
            stripeCustomerId: cachedData.stripeCustomerId,
            stripeSubscriptionId: cachedData.stripeSubscriptionId,
            subscriptionPlan: cachedData.subscriptionPlan,
            subscriptionStatus: cachedData.subscriptionStatus,
            subscriptionEndsAt: cachedData.subscriptionEndsAt ? new Date(cachedData.subscriptionEndsAt) : null,
          });
          setLoading(false);
          setPremiumLoading(false);
        } else {
          // Set user immediately with basic Firebase data for instant UI update
          const basicUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isPremium: false,
          };
          setUser(basicUser);
          setLoading(false);
          setPremiumLoading(true);
        }

        // Fetch fresh premium/subscription data in background
        try {
          const response = await fetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            }),
          });
          
          if (response.ok) {
            const dbUser = await response.json();
            
            // Cache the premium data
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: dbUser,
              }));
            }
            
            // Update with premium data once loaded
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              isPremium: dbUser.isPremium || false,
              stripeCustomerId: dbUser.stripeCustomerId,
              stripeSubscriptionId: dbUser.stripeSubscriptionId,
              subscriptionPlan: dbUser.subscriptionPlan,
              subscriptionStatus: dbUser.subscriptionStatus,
              subscriptionEndsAt: dbUser.subscriptionEndsAt ? new Date(dbUser.subscriptionEndsAt) : null,
            });
          }
        } catch (error) {
          console.error('Error syncing user:', error);
          // Keep basic user data even if sync fails
        } finally {
          setPremiumLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        setPremiumLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!auth || !googleProvider) {
      console.error('Firebase authentication is not configured. Please add Firebase credentials.');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      // User closed the popup - this is normal behavior, don't throw an error
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      // For other errors, log but don't throw to prevent unhandled errors
      console.error('Error signing in:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) {
      console.error('Firebase authentication is not configured. Please add Firebase credentials.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      console.error('Firebase authentication is not configured. Please add Firebase credentials.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const isAdmin = () => {
    if (!user?.email) return false;
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    return adminEmails.includes(user.email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, premiumLoading, signIn, signInWithEmail, signUpWithEmail, signOut, isAdmin }}>
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
