
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
    const initializeAuth = async () => {
      if (!isFirebaseConfigured) {
        console.log("AuthProvider: Firebase not configured. Skipping auth logic.");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("AuthProvider: Setting auth persistence...");
        // This is the critical fix: ensuring persistence is set before setting up the listener.
        await setPersistence(auth, browserLocalPersistence);
        console.log("AuthProvider: Auth persistence set successfully.");
      } catch (error) {
        console.error("AuthProvider: Failed to set persistence", error);
      }

      // onAuthStateChanged is the single source of truth for the user's state.
      // It will fire after the redirect is complete and the session is restored from local storage.
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("AuthProvider: onAuthStateChanged listener fired.");
        if (currentUser) {
          console.log("AuthProvider: Listener found authenticated user:", currentUser.displayName);
          setUser(currentUser);
        } else {
          console.log("AuthProvider: Listener found NO authenticated user.");
          setUser(null);
        }
        console.log("AuthProvider: Auth state determined, isLoading set to false.");
        setIsLoading(false);
      });

      // Cleanup function to remove the listener when the component unmounts.
      return () => {
        console.log("AuthProvider: Cleaning up onAuthStateChanged listener.");
        unsubscribe();
      };
    };

    initializeAuth();
  }, []); // Empty dependency array ensures this runs only once on mount.

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: `Please add your Firebase config to the .env file. Missing: ${missingKeys.join(', ')}` });
        return;
    }

    const provider = new GoogleAuthProvider();
    try {
      // signInWithRedirect navigates away. The listener will handle the result when the user returns.
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
