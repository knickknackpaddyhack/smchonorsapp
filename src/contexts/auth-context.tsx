
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
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

    // Set up the onAuthStateChanged listener. This is the single source of truth.
    // It will fire whenever the user's auth state changes, including after a redirect.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("AuthProvider: onAuthStateChanged listener fired.");
      if (user) {
        console.log("AuthProvider: Listener found authenticated user:", user.displayName);
        setUser(user);
      } else {
        console.log("AuthProvider: Listener found NO authenticated user.");
        setUser(null);
      }
      // We set loading to false only after the listener has given us an initial state.
      console.log("AuthProvider: isLoading set to false.");
      setIsLoading(false);
    });

    // When the component mounts, also check for a redirect result.
    // This is crucial for the redirect flow. `onAuthStateChanged` will still
    // be the one to update the state, but this call triggers the processing.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // If we get a result here, it means the user just signed in via redirect.
          // The onAuthStateChanged listener will shortly fire with the new user.
          console.log("AuthProvider: Successfully processed redirect result for user:", result.user.displayName);
          toast({
            title: `Welcome, ${result.user.displayName}!`,
            description: "You have been successfully signed in.",
          });
        }
      })
      .catch((error) => {
        console.error("AuthProvider: Error processing redirect result:", error);
        toast({
          variant: 'destructive',
          title: "Sign-in Failed",
          description: "Could not process login information. Please try again."
        });
      });

    // Cleanup the listener when the component unmounts.
    return () => {
      console.log("AuthProvider: Cleaning up listener.");
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: `Please add your Firebase config to the .env file. Missing: ${missingKeys.join(', ')}` });
        return;
    }

    const provider = new GoogleAuthProvider();
    try {
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
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
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
