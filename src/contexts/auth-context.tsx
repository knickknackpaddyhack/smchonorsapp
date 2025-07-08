
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
        setIsLoading(false);
        return;
    }

    let isMounted = true;

    // This listener reacts to any auth state changes,
    // including those triggered by getRedirectResult().
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (isMounted) {
            setUser(currentUser);
        }
    });

    // Process the redirect result. If it's successful,
    // it will trigger the onAuthStateChanged listener above.
    // After it's done, we know the initial auth state is settled.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User has successfully signed in via redirect.
          // onAuthStateChanged will handle setting the user object.
        }
      })
      .catch((error) => {
        console.error('Error processing redirect result:', error);
        toast({
          variant: 'destructive',
          title: 'Sign-in Failed',
          description: 'An error occurred during the sign-in process. Please try again.',
        });
      })
      .finally(() => {
        // Now that the redirect has been processed, we can safely
        // say the initial loading is complete.
        if (isMounted) {
            setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [toast]);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      toast({ variant: 'destructive', title: 'Firebase Not Configured', description: `Missing keys: ${missingKeys.join(', ')}` });
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
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
