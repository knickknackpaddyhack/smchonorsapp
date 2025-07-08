
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
    if (!isFirebaseConfigured) {
        setIsLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      toast({ variant: 'destructive', title: 'Firebase Not Configured', description: `Missing keys: ${missingKeys.join(', ')}` });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle the user state update.
    } catch (error: any) {
      console.error('Detailed error during Google Sign-In with popup:', error);
      
      let title = 'Sign-in Failed';
      let description = 'An unknown error occurred. Please check the console for more details.';

      if (error.code === 'auth/popup-blocked') {
        title = 'Popup Blocked';
        description = 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        title = 'Sign-in Cancelled';
        description = 'The sign-in process was cancelled. This can happen if the popup is closed or if there is a configuration issue. Please ensure your API key and OAuth settings are correct in the Google Cloud Console.';
      } else if (error.code === 'auth/operation-not-allowed' || error.message.includes('API_KEY_HTTP_REFERRER_BLOCKED')) {
         title = 'Configuration Error';
         description = 'There is a configuration issue with your project. Please check the "Authorized domains" in both Firebase and your Google Cloud API key settings. Also ensure the Google provider is enabled and a support email is set in the Firebase Console.';
      }

      toast({
        variant: 'destructive',
        title: title,
        description: description,
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
