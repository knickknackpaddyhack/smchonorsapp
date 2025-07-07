
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth, isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
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
    if (isSigningIn) return;

    const provider = new GoogleAuthProvider();
    try {
      setIsSigningIn(true);
      await signInWithPopup(auth, provider);
      // After the popup closes, onAuthStateChanged will handle the update.
    } catch (error: any) {
      console.error("Error signing in with Google:", error);

      if (error.code === 'auth/popup-closed-by-user') {
          // This is a common case when the user intentionally closes the popup.
          // No need to show a toast.
      } else {
          toast({
              variant: 'destructive',
              title: "Sign-in Failed",
              description: "Could not sign in with Google. Please check the console for details."
          });
      }
    } finally {
        setIsSigningIn(false);
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
    <AuthContext.Provider value={{ user, isLoading, isSigningIn, signInWithGoogle, signOut }}>
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
