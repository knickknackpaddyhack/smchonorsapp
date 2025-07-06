
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
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
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on mount to handle the redirect result.
    // It helps catch any errors that occurred during the Google sign-in flow.
    getRedirectResult(auth)
      .catch((error) => {
        console.error("Firebase redirect result error:", error);
        toast({
            variant: 'destructive',
            title: "Sign-in Failed",
            description: `Could not complete sign-in. Error: ${error.code}`
        });
      })
      .finally(() => {
        setIsProcessingRedirect(false);
      });
  }, [toast]);

  useEffect(() => {
    // This effect establishes the persistent auth state listener.
    // It waits until the redirect processing is finished to avoid race conditions.
    if (isProcessingRedirect) {
      return;
    }

    if (!isFirebaseConfigured) {
        setIsLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isProcessingRedirect]);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: "Please add your Firebase config to the .env file." });
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true);
      await signInWithRedirect(auth, provider);
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
      setUser(null);
    } catch (error) {
       console.error("Error signing out:", error);
       toast({
          variant: 'destructive',
          title: "Sign-out Failed",
          description: "Could not sign out. Please try again."
      });
    }
  };

  const finalIsLoading = isLoading || isProcessingRedirect;

  return (
    <AuthContext.Provider value={{ user, isLoading: finalIsLoading, signInWithGoogle, signOut }}>
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
