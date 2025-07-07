
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
      console.log("AuthProvider: Firebase not configured. Skipping auth logic.");
      setIsLoading(false);
      return;
    }

    // This effect runs once on app load. It's designed to handle the
    // complex redirect sign-in flow.
    
    console.log("AuthProvider: useEffect started. Checking for redirect result...");

    // Step 1: Process the redirect result. This is crucial. It "catches" the
    // user info after they return from the Google sign-in page.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // This means the user has just signed in via redirect.
          // The `onAuthStateChanged` listener below will soon fire with this user's data.
          console.log("AuthProvider: getRedirectResult SUCCESS. User found:", result.user.displayName);
        } else {
            // This means the page loaded without a sign-in redirect.
            // This is normal on most page loads.
            console.log("AuthProvider: getRedirectResult finished. No new redirect user.");
        }
      })
      .catch((error) => {
        // Handle any errors from the redirect process itself.
        console.error("AuthProvider: Error processing redirect result:", error);
        toast({
          variant: 'destructive',
          title: 'Sign-In Failed',
          description: `An error occurred during the sign-in process. Code: ${error.code}`,
        });
      })
      .finally(() => {
        // Step 2: Set up the central listener. This is the single source of truth
        // for the user's login status going forward. It runs *after* the redirect
        // check is complete.
        console.log("AuthProvider: Setting up onAuthStateChanged listener.");
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log("AuthProvider: onAuthStateChanged fired.");
          if (user) {
            console.log("AuthProvider: Listener found an authenticated user:", user.displayName);
            setUser(user);
          } else {
            console.log("AuthProvider: Listener found NO authenticated user.");
            setUser(null);
          }
          // No matter what, the initial auth check is now complete.
          console.log("AuthProvider: Setting isLoading to false.");
          setIsLoading(false);
        });

        // The 'unsubscribe' function is returned for cleanup. When this component
        // is removed from the screen, React will call this function to remove the
        // listener and prevent memory leaks. It does not sign the user in or out.
        return () => {
          console.log("AuthProvider: Cleaning up onAuthStateChanged listener.");
          unsubscribe();
        }
      });
  }, [toast]);


  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: `Please add your Firebase config to the .env file. Missing: ${missingKeys.join(', ')}` });
        return;
    }

    const provider = new GoogleAuthProvider();
    try {
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
