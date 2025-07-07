
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { updateUserProfile } from '@/services/user';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (newProfileData: Partial<Pick<UserProfile, 'name' | 'email'>>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
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

      setIsLoading(true);
      try {
        const userRef = doc(db, 'users', authUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            // Explicitly construct the profile object for type safety
            const userProfile: UserProfile = {
                id: userSnap.id,
                name: data.name || 'Anonymous',
                email: data.email || '',
                photoURL: data.photoURL || '',
                joinedDate: data.joinedDate || new Date().toISOString(),
                honorsPoints: data.honorsPoints || 0,
                engagements: Array.isArray(data.engagements) ? data.engagements : [],
                semesterGrad: data.semesterGrad || null,
                semesterJoined: data.semesterJoined || null,
                termStartSMC: data.termStartSMC || null,
            };
            setProfile(userProfile);
        } else {
          // Profile doesn't exist, create it right here.
          const newProfile: UserProfile = {
            id: authUser.uid,
            name: authUser.displayName || 'New User',
            email: authUser.email || '',
            photoURL: authUser.photoURL || '',
            joinedDate: new Date().toISOString(),
            honorsPoints: 0,
            engagements: [],
            semesterGrad: null,
            semesterJoined: null,
            termStartSMC: null,
          };
          
          const { id, ...profileToSave } = newProfile;
          await setDoc(userRef, profileToSave);
          
          setProfile(newProfile);
        }
      } catch (error) {
        console.error("Error handling user profile:", error);
        toast({
            variant: 'destructive',
            title: "Profile Error",
            description: "Could not load or create your profile. Please check your Firestore security rules and configuration.",
        });
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthLoading && isFirebaseConfigured) {
      handleUserProfile();
    } else if (!isFirebaseConfigured) {
        setIsLoading(false);
    }
  }, [authUser, isAuthLoading, toast]);
  
  const updateProfile = async (newProfileData: Partial<Pick<UserProfile, 'name' | 'email'>>) => {
    if (!profile || !authUser) throw new Error("No profile to update.");
    
    const oldProfile = profile;
    setProfile(p => p ? {...p, ...newProfileData} : null);

    try {
        await updateUserProfile(authUser.uid, newProfileData);
    } catch (error) {
        setProfile(oldProfile);
        throw error;
    }
  };

  return (
    <UserContext.Provider value={{ profile, isLoading, updateProfile }}>
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
