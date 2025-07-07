
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
    // This effect handles the result of a redirect sign-in attempt.
    // It should be called once when the component mounts.
    if (isFirebaseConfigured) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            // This block runs if the user has just signed in via redirect
            // and the result has been successfully retrieved.
            // The onAuthStateChanged listener below will handle setting the user state.
            console.log("Firebase redirect result processed successfully.");
          }
        })
        .catch((error) => {
          // Handle errors from getRedirectResult
          console.error("Error getting redirect result:", error);
          toast({
            variant: 'destructive',
            title: "Sign-in Error",
            description: `There was a problem authenticating your account: ${error.message}`,
          });
        });

      // onAuthStateChanged is the primary listener for auth state.
      // It will fire when the redirect result is processed, or on any other auth state change.
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
    } else {
      setIsLoading(false); // Not configured, so not loading.
    }
  }, [toast]);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        toast({ variant: 'destructive', title: "Firebase Not Configured", description: `Please add your Firebase config to the .env file. Missing: ${missingKeys.join(', ')}` });
        return;
    }

    const provider = new GoogleAuthProvider();
    try {
      // Use full-page redirect which is more robust than a popup.
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
