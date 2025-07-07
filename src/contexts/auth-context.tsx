
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  User,
  setPersistence,
  browserLocalPersistence
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
    if (!isFirebaseConfigured) {
        console.log("AuthProvider: Firebase not configured. Skipping auth listener.");
        setIsLoading(false);
        return;
    }

    console.log("AuthProvider: Setting up onAuthStateChanged listener.");

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AuthProvider: onAuthStateChanged listener fired.");
      if (currentUser) {
        console.log(`AuthProvider: Listener has an authenticated user: ${currentUser.displayName}`);
        setUser(currentUser);
      } else {
        console.log("AuthProvider: Listener has NO authenticated user.");
        setUser(null);
      }
      // This is the most important part: we only declare auth state "resolved"
      // AFTER the listener has fired for the first time.
      console.log("AuthProvider: Auth state determined. isLoading set to false.");
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
        console.log("AuthProvider: Cleaning up listener.");
        unsubscribe();
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      toast({ variant: 'destructive', title: 'Firebase Not Configured', description: `Missing keys: ${missingKeys.join(', ')}` });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      // Set persistence BEFORE the redirect. This is critical for the session
      // to survive the redirect.
      await setPersistence(auth, browserLocalPersistence);
      console.log("AuthProvider: Auth persistence set. Initiating redirect sign-in.");
      await signInWithRedirect(auth, provider);
      // Note: The code flow stops here as the browser redirects.
      // The result is handled by onAuthStateChanged when the user returns.
    } catch (error: any) {
      console.error('Error initiating sign in', error);
      toast({ variant: 'destructive', title: 'Sign-in Failed', description: 'Could not start the sign-in process.' });
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await firebaseSignOut(auth);
      // The onAuthStateChanged listener will handle clearing the user state.
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
