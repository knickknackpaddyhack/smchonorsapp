
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserProfile } from '@/lib/types';
import { getUserProfile, updateUserProfile, createUserProfile } from '@/services/user';
import { useAuth } from './auth-context';

interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (newProfileData: Partial<Pick<UserProfile, 'name' | 'email'>>) => Promise<void>;
  createProfile: (newProfileData: { name: string, email: string, photoURL?: string }) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!authUser) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
        const profileData = await getUserProfile(authUser.uid);
        setProfile(profileData);
    } catch (error) {
        console.error("Failed to fetch user profile", error);
        setProfile(null);
    } finally {
        setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    // Only fetch profile if auth is resolved
    if (!isAuthLoading) {
      fetchProfile();
    }
  }, [fetchProfile, isAuthLoading]);
  
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

  const createProfile = async (newProfileData: { name: string, email: string, photoURL?: string }) => {
    if (!authUser) throw new Error("User is not authenticated.");
    
    setIsLoading(true);
    try {
      const newProfile = await createUserProfile(authUser.uid, newProfileData);
      setProfile(newProfile);
    } catch (error) {
      console.error("Failed to create profile", error);
      setProfile(null); 
      throw error;
    } finally {
      setIsLoading(false);
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
