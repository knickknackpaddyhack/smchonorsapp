
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
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
    // onAuthStateChanged is the single source of truth. It handles the initial
    // state, sign-ins, sign-outs, and the result of a successful popup.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      toast({ variant: 'destructive', title: 'Firebase Not Configured', description: `Missing keys: ${missingKeys.join(', ')}` });
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      // Using signInWithPopup instead of signInWithRedirect
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the successful sign-in
    } catch (error: any) {
        console.error("Error during Google Sign-In with popup:", error);

        // Provide a consolidated, helpful error message.
        toast({
            variant: 'destructive',
            title: 'Sign-In Failed',
            description: 'The sign-in process was cancelled or failed. Please ensure popups are not blocked by your browser and that your Google Cloud API key and OAuth settings are correctly configured.'
        });
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will automatically update the user to null.
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
