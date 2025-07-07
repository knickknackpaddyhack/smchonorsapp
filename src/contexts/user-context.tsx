
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/services/user';

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
        console.log("UserProvider: No authenticated user. Clearing profile.");
        setProfile(null);
        setIsLoading(false);
        return;
      }

      console.log("UserProvider: Authenticated user found. Handling profile for UID:", authUser.uid);
      setIsLoading(true);
      const userRef = doc(db, 'users', authUser.uid);

      try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          console.log("UserProvider: Profile document exists. Setting profile.");
          const data = userSnap.data();
          const userProfile: UserProfile = {
            id: userSnap.id,
            name: data.name || 'Anonymous',
            email: data.email || '',
            photoURL: data.photoURL || '',
            joinedDate: data.joinedDate?.toDate ? data.joinedDate.toDate().toISOString() : new Date().toISOString(), // Handle timestamp object
            honorsPoints: data.honorsPoints || 0,
            engagements: Array.isArray(data.engagements) ? data.engagements : [],
            semesterGrad: data.semesterGrad || null,
            semesterJoined: data.semesterJoined || null,
            termStartSMC: data.termStartSMC || null,
          };
          setProfile(userProfile);
        } else {
          console.log("UserProvider: Profile document does NOT exist. Creating new profile.");
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
          console.log("UserProvider: New profile document created in Firestore.");
          
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
          
          setProfile(newProfile);
          toast({
            title: "Welcome!",
            description: "Your profile has been created.",
          });
        }
      } catch (error) {
        console.error("UserProvider: CRITICAL ERROR handling user profile:", error);
        toast({
            variant: 'destructive',
            title: "Profile Error",
            description: `Could not load or create your profile. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            duration: 10000,
        });
        setProfile(null);
      } finally {
        console.log("UserProvider: Finished handling profile. Setting loading to false.");
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
