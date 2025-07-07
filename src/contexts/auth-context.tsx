
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, User } from 'firebase/auth';
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

    // onAuthStateChanged is the recommended way to get the current user.
    // It will fire once a redirect is complete and the auth state is known.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase Auth Error:", error);
      toast({
          variant: 'destructive',
          title: "Authentication Error",
          description: "An error occurred during authentication."
      });
      setIsLoading(false);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: `Please add your Firebase config to the .env file. Missing: ${missingKeys.join(', ')}` });
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
      // Set loading to true before initiating the redirect
      setIsLoading(true);
      await signInWithRedirect(auth, provider);
      // The onAuthStateChanged listener will handle the result of the redirect.
    } catch (error) {
      setIsLoading(false);
      console.error("Error signing in with Google:", error);
      toast({
          variant: 'destructive',
          title: "Sign-in Failed",
          description: "Could not initiate sign-in with Google. Please try again."
      });
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // The onAuthStateChanged listener will set the user to null.
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
