
'use server';

import { doc, getDoc, setDoc, collection, getDocs, writeBatch, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import type { UserProfile, Engagement } from '@/lib/types';
import { engagements as seedEngagementsData } from '@/lib/data';

// This function checks if a user has engagements, and if not, seeds them.
// It's meant for backfilling data for users created before this logic was implemented.
async function seedMissingEngagements(uid: string): Promise<void> {
    if (!isFirebaseConfigured) return;

    const engagementsColRef = collection(db!, 'users', uid, 'engagements');
    
    try {
        const engagementsSnap = await getDocs(engagementsColRef);

        if (engagementsSnap.empty) {
            console.log(`User ${uid} has no engagements. Seeding now.`);
            const batch = writeBatch(db!);
            let totalPoints = 0;
            seedEngagementsData.forEach(engagement => {
                const { id, ...engagementData } = engagement;
                const engagementRef = doc(engagementsColRef, id);
                batch.set(engagementRef, engagementData);
                totalPoints += engagement.points;
            });

            // Also update the points on the main profile
            const userRef = doc(db!, 'users', uid);
            batch.update(userRef, { honorsPoints: totalPoints });

            await batch.commit();
        }
    } catch(error) {
        console.error("Error during background seeding of user engagements:", error);
    }
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured) {
        return null;
    }
    
    try {
        const userRef = doc(db!, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
             // As a fallback, seed engagements if they are missing. This is non-blocking.
            seedMissingEngagements(uid);
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
            console.log("Attempted to create profile for existing user. Returning existing profile.");
            return { id: userSnap.id, ...userSnap.data() } as UserProfile;
        }

        const totalInitialPoints = seedEngagementsData.reduce((acc, curr) => acc + curr.points, 0);

        const newProfile: UserProfile = {
            id: uid,
            name: profileData.name,
            email: profileData.email,
            photoURL: profileData.photoURL || '',
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            honorsPoints: totalInitialPoints,
        };
        
        const batch = writeBatch(db!);
        
        // 1. Set the main user profile document
        const { id, ...profileToSave } = newProfile;
        batch.set(userRef, profileToSave);

        // 2. Set the documents in the engagements subcollection
        const engagementsColRef = collection(db!, 'users', uid, 'engagements');
        seedEngagementsData.forEach(engagement => {
            const { id: engagementId, ...engagementData } = engagement;
            const engagementRef = doc(engagementsColRef, engagementId);
            batch.set(engagementRef, engagementData);
        });

        // Commit all writes at once
        await batch.commit();

        return newProfile;
    } catch (error) {
        console.error("Error creating user profile with batch write:", error);
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Permission denied'))) {
            throw new Error("Creation failed: Permission Denied. Please check your Firestore security rules in the Firebase console. They may be too restrictive.");
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
        return seedEngagementsData;
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
