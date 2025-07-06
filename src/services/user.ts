
'use server';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
            // Explicitly construct the profile object for type safety
            const userProfile: UserProfile = {
                id: userSnap.id,
                name: data.name || 'Anonymous',
                email: data.email || '',
                photoURL: data.photoURL || '',
                joinedDate: data.joinedDate || new Date().toLocaleDateString(),
                honorsPoints: data.honorsPoints || 0,
                engagements: Array.isArray(data.engagements) ? data.engagements : [],
            };
            return userProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
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
