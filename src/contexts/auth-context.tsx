
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
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        // First, explicitly process the redirect result. This is crucial for
        // ensuring the auth state is updated before the listener runs.
        await getRedirectResult(auth);
      } catch (error) {
        console.error("Error processing redirect result:", error);
        toast({
          variant: 'destructive',
          title: 'Sign-In Failed',
          description: `An error occurred during the sign-in process. Please check the console.`,
        });
      }
      
      // After any potential redirect has been processed, set up the listener.
      // This will now correctly report the user's state.
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setIsLoading(false);
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
      setUser(null); // Explicitly clear the user state
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
