'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserProfile } from '@/lib/types';
import { getUserProfile, updateUserProfile, createUserProfile } from '@/services/user';

interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (newProfileData: Partial<Pick<UserProfile, 'name' | 'email'>>) => Promise<void>;
  createProfile: (newProfileData: Pick<UserProfile, 'name' | 'email'>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
        const profileData = await getUserProfile();
        setProfile(profileData);
    } catch (error) {
        console.error("Failed to fetch user profile", error);
        setProfile(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  const updateProfile = async (newProfileData: Partial<Pick<UserProfile, 'name' | 'email'>>) => {
    if (!profile) throw new Error("No profile to update.");
    
    const oldProfile = profile;
    setProfile(p => p ? {...p, ...newProfileData} : null);

    try {
        await updateUserProfile(newProfileData);
    } catch (error) {
        setProfile(oldProfile);
        throw error;
    }
  };

  const createProfile = async (newProfileData: Pick<UserProfile, 'name' | 'email'>) => {
    try {
      await createUserProfile(newProfileData);
      await fetchProfile(); // Re-fetch profile after creation
    } catch (error) {
      console.error("Failed to create profile", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ profile, isLoading, updateProfile, createProfile }}>
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
