
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signOut as firebaseSignOut, 
  User,
  getRedirectResult
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

    // onAuthStateChanged is the primary listener for auth state.
    // It will fire with the cached user, or when the user signs in or out.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    
    // getRedirectResult processes the sign-in result from a redirect.
    // It's crucial to handle its completion to know when the initial auth state is resolved.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // A user has successfully signed in via redirect.
          // The `onAuthStateChanged` listener above will have already been called with the user object.
          toast({
            title: "Signed In",
            description: `Welcome, ${result.user.displayName}!`,
          });
        }
      })
      .catch((error) => {
        // Handle errors from getRedirectResult, e.g., if the user cancels.
        console.error("Error getting redirect result:", error);
        toast({
          variant: 'destructive',
          title: "Sign-in Error",
          description: `There was a problem authenticating your account: ${error.message}`,
        });
      })
      .finally(() => {
        // Once the redirect result is processed (or if there was no redirect),
        // we can safely say the initial authentication loading is complete.
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
