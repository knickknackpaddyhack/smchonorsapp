
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      toast({ variant: 'destructive', title: 'Firebase Not Configured', description: `Missing keys: ${missingKeys.join(', ')}` });
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
        console.error("Authentication Error Details:", error);
        
        const errorCode = error.code || 'UNKNOWN_ERROR';
        const errorMessage = `Sign-in failed with error code: ${errorCode}. This often indicates a configuration issue with your project's API key or OAuth settings in the Google Cloud Console. Please double-check your settings.`;

        toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: errorMessage,
            duration: 9000,
        });
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      toast({ variant: 'destructive', title: 'Sign-out Failed', description: 'Could not sign out.' });
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
