
'use server';

import { doc, getDoc, setDoc, collection, getDocs, writeBatch, updateDoc, query, orderBy } from 'firebase/firestore';
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
            return { id: userSnap.id, ...userSnap.data() } as UserProfile;
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
            return { id: userSnap.id, ...userSnap.data() } as UserProfile;
        }

        const newProfile: UserProfile = {
            id: uid,
            name: profileData.name,
            email: profileData.email,
            photoURL: profileData.photoURL || '',
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            honorsPoints: 0,
        };
        
        const { id, ...profileToSave } = newProfile;
        // Perform a simple, single set operation to create the user profile.
        // This is the most reliable way to ensure the document is created.
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


export async function updateUserProfile(uid: string, profileData: Partial<Omit<UserProfile, 'id'>>): Promise<void> {
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
        const engagementsColRef = collection(db!, 'users', uid, 'engagements');
        const q = query(engagementsColRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        const engagements = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Engagement));
        
        return engagements;
    } catch (error) {
        console.error("Error fetching engagements:", error);
        return []; // Return empty on error
    }
}
