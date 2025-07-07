
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  User,
  setPersistence,
  browserLocalPersistence,
  getRedirectResult,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined = undefined;

    const initializeAuth = async () => {
      console.log('AuthProvider: Starting auth processing...');
      if (!isFirebaseConfigured) {
        console.log('AuthProvider: Firebase not configured. Skipping.');
        setIsLoading(false);
        return;
      }

      try {
        // This is the key: getRedirectResult must be called on every page load.
        // It resolves to the signed-in user if the page is the result of a
        // redirect sign-in, or to null otherwise.
        const result = await getRedirectResult(auth);
        if (result) {
          console.log(`AuthProvider: User found from redirect: ${result.user.displayName}`);
          // The user is now signed in. The onAuthStateChanged listener below will
          // fire with this user and handle setting the state.
        } else {
            console.log('AuthProvider: No redirect result. This is a normal page load.');
        }
      } catch (error) {
        console.error('AuthProvider: Error getting redirect result.', error);
      }

      // onAuthStateChanged is the single source of truth. It fires after
      // getRedirectResult completes and whenever the auth state changes.
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log('AuthProvider: onAuthStateChanged fired.');
        if (currentUser) {
          console.log(`AuthProvider: Listener has an authenticated user: ${currentUser.displayName}`);
          setUser(currentUser);
        } else {
          console.log('AuthProvider: Listener has NO authenticated user.');
          setUser(null);
        }
        console.log('AuthProvider: Auth state determined. isLoading set to false.');
        setIsLoading(false);
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        console.log('AuthProvider: Cleaning up listener.');
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      toast({ variant: 'destructive', title: 'Firebase Not Configured', description: `Missing keys: ${missingKeys.join(', ')}` });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      // Must set persistence BEFORE the redirect.
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Error initiating sign in', error);
      toast({ variant: 'destructive', title: 'Sign-in Failed', description: 'Could not start the sign-in process.' });
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      toast({ variant: 'destructive', title: 'Sign-out Failed', description: 'Could not sign out.' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
