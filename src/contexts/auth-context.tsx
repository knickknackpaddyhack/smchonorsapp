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
  const { toast } = useToast();

  useEffect(() => {
    if (!isFirebaseConfigured) {
        setIsLoading(false);
        return;
    }

    // This is called once on mount to handle the result of a redirect sign-in.
    // It's important to handle this to catch errors from the redirect flow.
    getRedirectResult(auth)
        .catch((error) => {
            console.error("Firebase redirect error:", error);
            if (error.code === 'auth/unauthorized-domain') {
                 toast({
                    variant: 'destructive',
                    title: "Authorization Error",
                    description: "This app's domain is not authorized for sign-in. Please check your Firebase console settings."
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: "Sign-in Failed",
                    description: "Could not sign in with Google after redirect. Please try again."
                });
            }
        });

    // onAuthStateChanged is the primary listener for auth state.
    // It will fire when the user signs in (including after a redirect), signs out, or when the token is refreshed.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true); // Indicate loading before redirect
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
