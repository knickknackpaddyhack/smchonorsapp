
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
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
    if (!isFirebaseConfigured) {
      console.log("AuthProvider: Firebase not configured. Skipping auth logic.");
      setIsLoading(false);
      return;
    }

    // onAuthStateChanged is the single source of truth. It fires on sign-in,
    // sign-out, and when the page loads, automatically handling the result
    // of a sign-in redirect.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("AuthProvider: onAuthStateChanged listener fired.");
      if (user) {
        // User is signed in.
        console.log("AuthProvider: User is authenticated:", user.displayName);
        setUser(user);
      } else {
        // User is signed out.
        console.log("AuthProvider: User is not authenticated.");
        setUser(null);
      }
      // The initial authentication check is complete.
      setIsLoading(false);
      console.log("AuthProvider: isLoading set to false.");
    });

    // Cleanup subscription on unmount
    return () => {
        console.log("AuthProvider: Cleaning up listener.");
        unsubscribe();
    }
  }, [toast]);


  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: `Please add your Firebase config to the .env file. Missing: ${missingKeys.join(', ')}` });
        return;
    }

    const provider = new GoogleAuthProvider();
    try {
      // Start the redirect sign-in process.
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Error initiating sign in with Google redirect:", error);
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
      // The onAuthStateChanged listener will handle setting user to null.
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
