
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

// Create a mock user object to bypass login in the development environment
const mockUser: User = {
  uid: 'mock-user-id',
  email: 'test.user@example.com',
  displayName: 'Test User',
  photoURL: 'https://placehold.co/40x40.png',
  providerId: 'google.com',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};


export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to the mock user to simulate a logged-in state
  const [user, setUser] = useState<User | null>(mockUser);
  // Default to false since we are not performing a real auth check
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // The original onAuthStateChanged is disabled to allow the mock user to persist.
  /*
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  */

  const signInWithGoogle = async () => {
    toast({
        title: "Authentication Bypassed",
        description: "Login is simulated in this environment. You can proceed as a logged-in user.",
    });
  };

  const signOut = async () => {
    toast({
        title: "Authentication Bypassed",
        description: "Sign-out is disabled in this simulated environment.",
    });
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
