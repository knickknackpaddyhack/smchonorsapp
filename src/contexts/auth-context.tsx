
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
    // This async function inside useEffect allows us to control the sequence of operations precisely.
    const processAuth = async () => {
      console.log("AuthProvider: Starting auth processing...");

      try {
        // Step 1: Explicitly process the redirect result first. This "catches" the user info from Google.
        const result = await getRedirectResult(auth);
        if (result) {
          // A user has successfully signed in via redirect.
          // The onAuthStateChanged listener below will handle setting the user state.
          console.log("AuthProvider: Successfully processed redirect result for user:", result.user.displayName);
           toast({
            title: `Welcome, ${result.user.displayName}!`,
            description: "You have been successfully signed in.",
          });
        } else {
            console.log("AuthProvider: No new user from redirect result.");
        }
      } catch (error) {
        // This will catch errors during the redirect process itself.
        console.error("AuthProvider: Error processing redirect result:", error);
        toast({
          variant: 'destructive',
          title: "Sign-in Failed",
          description: "Could not process login information. Please try again."
        });
      }

      // Step 2: Set up the definitive listener. This will now fire with the correct user state
      // because the redirect has been processed.
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("AuthProvider: onAuthStateChanged listener fired.");
        if (currentUser) {
          console.log("AuthProvider: Listener found authenticated user:", currentUser.displayName);
          setUser(currentUser);
        } else {
          console.log("AuthProvider: Listener found NO authenticated user.");
          setUser(null);
        }
        // Step 3: Only set loading to false AFTER the listener has given us an initial state.
        // This is the key to preventing the race condition.
        console.log("AuthProvider: isLoading set to false.");
        setIsLoading(false);
      });

      // Cleanup function to remove the listener when the component unmounts.
      return () => {
        console.log("AuthProvider: Cleaning up onAuthStateChanged listener.");
        unsubscribe();
      };
    };

    if (isFirebaseConfigured) {
      processAuth();
    } else {
       console.log("AuthProvider: Firebase not configured. Skipping auth logic.");
       setIsLoading(false);
    }
    // The empty dependency array ensures this effect runs only once on mount.
    // Toast is memoized by its hook, but can be added if linting requires.
  }, [toast]);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: `Please add your Firebase config to the .env file. Missing: ${missingKeys.join(', ')}` });
        return;
    }

    const provider = new GoogleAuthProvider();
    try {
      // This function does not return anything, it just navigates away.
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
      // The onAuthStateChanged listener will handle state updates.
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
