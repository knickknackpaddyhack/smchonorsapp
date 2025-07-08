
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

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleUserProfile = async () => {
      if (!authUser) {
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      // We have a valid authUser, start the profile loading process.
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
          // User exists in Auth, but not in Firestore. Create their profile.
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
