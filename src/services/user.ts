
'use server';

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import type { UserProfile, Engagement } from '@/lib/types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured) {
        return null;
    }
    
    try {
        const userRef = doc(db!, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            // Ensure engagements array exists for type safety, even if not in DB
            return { id: userSnap.id, engagements: [], ...data } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

export async function createUserProfile(uid: string, profileData: { name: string, email: string, photoURL?: string }): Promise<UserProfile> {
    if (!isFirebaseConfigured) {
        throw new Error(`Firebase not configured. Missing keys: ${missingKeys.join(',')}. Please check your .env file.`);
    }
    const userRef = doc(db!, 'users', uid);

    try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            console.warn("Attempted to create profile for existing user. Returning existing profile.");
            const data = userSnap.data();
            return { id: userSnap.id, engagements: [], ...data } as UserProfile;
        }

        const newProfile: UserProfile = {
            id: uid,
            name: profileData.name,
            email: profileData.email,
            photoURL: profileData.photoURL || '',
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            honorsPoints: 0,
            engagements: [], // Initialize with an empty engagements array
        };
        
        const { id, ...profileToSave } = newProfile;
        await setDoc(userRef, profileToSave);

        return newProfile;
    } catch (error) {
        console.error("CRITICAL ERROR creating user profile:", error);
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Permission denied'))) {
            throw new Error("Creation failed: Permission Denied. Your Firestore security rules are likely too restrictive. Please check them in the Firebase console.");
        }
        throw new Error("An unknown server error occurred while creating the profile.");
    }
}


export async function updateUserProfile(uid: string, profileData: Partial<Omit<UserProfile, 'id' | 'engagements'>>): Promise<void> {
   if (!isFirebaseConfigured) {
     throw new Error(`Firebase not configured. Missing keys: ${missingKeys.join(', ')}. Please check your root .env file.`);
   }
   try {
    const userRef = doc(db!, 'users', uid);
    await updateDoc(userRef, profileData);
   } catch (error) {
     console.error("Error updating user profile:", error);
     if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Permission denied'))) {
        throw new Error("Update failed: Permission Denied. Please check your Firestore security rules.");
     }
     throw new Error("Failed to update profile.");
   }
}

export async function getUserEngagements(uid: string): Promise<Engagement[]> {
    if (!isFirebaseConfigured) {
        return [];
    }

    try {
        const userProfile = await getUserProfile(uid);
        if (userProfile && Array.isArray(userProfile.engagements)) {
            // Sort engagements by date, descending
            return userProfile.engagements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        return [];
    } catch (error) {
        console.error("Error fetching engagements from user profile:", error);
        return []; // Return empty on error
    }
}
