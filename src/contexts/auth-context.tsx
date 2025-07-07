
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
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

    return () => unsubscribe();
  }, [toast]);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: `Please add your Firebase config to the .env file. Missing: ${missingKeys.join(', ')}` });
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true);
      await signInWithPopup(auth, provider);
      // After the popup closes, onAuthStateChanged will handle the update.
      // No need to call setIsLoading(false) here, onAuthStateChanged will do it.
    } catch (error: any) {
      setIsLoading(false); // Set loading to false on error
      console.error("Error signing in with Google:", error);

      if (error.code === 'auth/popup-closed-by-user') {
          toast({
              variant: 'default',
              title: "Sign-in Cancelled",
              description: "You closed the sign-in window before completing the process."
          });
      } else {
          toast({
              variant: 'destructive',
              title: "Sign-in Failed",
              description: "Could not sign in with Google. Please check the console for details."
          });
      }
    }
  };

  const signOut = async () => {
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
