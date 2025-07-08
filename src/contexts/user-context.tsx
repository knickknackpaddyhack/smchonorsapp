
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a mock user profile to use when authentication is bypassed
const mockProfile: UserProfile = {
    id: 'mock-user-id',
    name: 'Test User',
    email: 'test.user@example.com',
    photoURL: 'https://placehold.co/80x80.png',
    joinedDate: new Date().toISOString(),
    honorsPoints: 425,
    engagements: [],
    semesterGrad: 'Spring 2025',
    semesterJoined: 'Fall 2023',
    termStartSMC: 'Fall 2022',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  // Default to the mock profile to simulate a logged-in state
  const [profile, setProfile] = useState<UserProfile | null>(mockProfile);
  // Default to false since we are not performing a real profile fetch
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // The original profile fetching logic is disabled to allow the mock profile to be used.
  /*
  useEffect(() => {
    const handleUserProfile = async () => {
      if (!authUser) {
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      if (!isFirebaseConfigured) {
          console.error("UserProvider: Cannot handle profile because Firebase is not configured.");
          setIsLoading(false);
          return;
      }

      const userRef = doc(db, 'users', authUser.uid);

      try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const userProfile: UserProfile = {
            id: userSnap.id,
            name: data.name || 'Anonymous',
            email: data.email || '',
            photoURL: data.photoURL || '',
            joinedDate: data.joinedDate?.toDate ? data.joinedDate.toDate().toISOString() : new Date().toISOString(),
            honorsPoints: data.honorsPoints || 0,
            engagements: Array.isArray(data.engagements) ? data.engagements : [],
            semesterGrad: data.semesterGrad || null,
            semesterJoined: data.semesterJoined || null,
            termStartSMC: data.termStartSMC || null,
          };
          setProfile(userProfile);
        } else {
          const newProfileData = {
            name: authUser.displayName || 'New User',
            email: authUser.email || '',
            photoURL: authUser.photoURL || '',
            joinedDate: serverTimestamp(),
            honorsPoints: 0,
            engagements: [],
            semesterGrad: null,
            semesterJoined: null,
            termStartSMC: null,
          };

          await setDoc(userRef, newProfileData);
          
          const newProfile: UserProfile = {
            id: authUser.uid,
            ...newProfileData,
            joinedDate: new Date().toISOString(),
          };
          
          setProfile(newProfile);
          toast({
            title: `Welcome, ${newProfile.name}!`,
            description: "Your profile has been created.",
          });
        }
      } catch (error) {
        console.error(`UserProvider: CRITICAL ERROR handling profile for ${authUser.uid}:`, error);
        toast({
            variant: 'destructive',
            title: "Profile Error",
            description: `Could not load or create your profile. Please check your Firestore permissions.`,
            duration: 9000,
        });
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    handleUserProfile();
  }, [authUser, toast]);
  */

  return (
    <UserContext.Provider value={{ profile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
