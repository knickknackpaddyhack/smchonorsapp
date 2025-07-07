
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  User,
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
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }
    
    // First, process any pending redirect result.
    // This runs once on mount and ensures we capture the auth state from the redirect.
    getRedirectResult(auth)
      .catch((error) => {
        console.error("Error processing redirect result:", error);
        toast({
          variant: 'destructive',
          title: 'Sign-In Failed',
          description: `An error occurred during the sign-in process. Please check the console.`,
        });
      })
      .finally(() => {
        // After processing the redirect, set up the central listener.
        // This is the single source of truth for the user's login status.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          // This callback fires whenever the auth state changes.
          // e.g., after getRedirectResult, signIn, or signOut.
          setUser(user);
          // We only set loading to false here, ensuring the app waits until
          // the initial auth state (including any redirect) is fully determined.
          setIsLoading(false);
        });

        // Return the unsubscribe function for cleanup.
        // It's important this is done inside the .finally() so it's tied to the
        // same lifecycle as the onAuthStateChanged listener itself.
        return () => unsubscribe();
      });

  }, [toast]);


  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: `Please add your Firebase config to the .env file. Missing: ${missingKeys.join(', ')}` });
        return;
    }

    const provider = new GoogleAuthProvider();
    try {
      // This function doesn't return anything. It just redirects.
      // The result is caught by getRedirectResult on page load.
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Error initiating sign in with Google:", error);
      toast({
          variant: 'destructive',
          title: "Sign-in Failed",
          description: "Could not start the sign-in process. Please check the console for details."
      });
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await firebaseSignOut(auth);
      // The onAuthStateChanged listener will automatically handle setting the user to null.
    } catch (error) {
       console.error("Error signing out:", error);
       toast({
          variant: 'destructive',
          title: "Sign-out Failed",
          description: "Could not sign out. Please try again."
      });
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
