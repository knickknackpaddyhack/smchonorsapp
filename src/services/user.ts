
'use server';

import { doc, getDoc, setDoc, collection, getDocs, writeBatch, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import type { UserProfile, Engagement } from '@/lib/types';
import { engagements as seedEngagementsData } from '@/lib/data';

// This function now handles seeding and awarding points.
// It's designed to be called without being awaited ("fire and forget").
async function seedEngagementsAndAwardPoints(uid: string): Promise<void> {
    if (!isFirebaseConfigured) return;

    const engagementsColRef = collection(db!, 'users', uid, 'engagements');
    
    try {
        // Check if engagements already exist to prevent re-seeding and re-awarding points
        const existingEngagements = await getDocs(engagementsColRef);
        if (!existingEngagements.empty) {
            console.log("User already has engagements, skipping seed.");
            return;
        }

        console.log("Seeding engagement data and awarding points for new user...");
        const batch = writeBatch(db!);
        let totalPoints = 0;

        seedEngagementsData.forEach(engagement => {
            const { id, ...engagementData } = engagement;
            const engagementRef = doc(engagementsColRef, id);
            batch.set(engagementRef, engagementData);
            totalPoints += engagement.points;
        });
        
        await batch.commit(); // Writes the engagements subcollection

        // Now, update the user's profile with the points
        const userRef = doc(db!, 'users', uid);
        await updateDoc(userRef, { honorsPoints: totalPoints });

    } catch(error) {
        console.error("Error during background seeding of user engagements:", error);
        // We don't throw here because this is a background process.
        // The user is already logged in. An error here is not critical for the UI.
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
    try {
        const userRef = doc(db!, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() } as UserProfile;
        }

        // Create the user profile with 0 points first. This is a fast, simple write.
        // This ensures the user document exists immediately, unblocking the login flow.
        const newProfile: UserProfile = {
            id: uid,
            name: profileData.name,
            email: profileData.email,
            photoURL: profileData.photoURL || '',
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            honorsPoints: 0,
        };
        
        const { id, ...profileToSave } = newProfile;
        await setDoc(userRef, profileToSave);

        // After the critical profile document is created, start the background job
        // to seed their initial engagement data and award points.
        // We DO NOT await this, so the UI is not blocked.
        seedEngagementsAndAwardPoints(uid);

        return newProfile; // Return the profile immediately with 0 points.
    } catch (error) {
        console.error("Error creating user profile:", error);
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Permission denied'))) {
            throw new Error("Creation failed: Permission Denied. Please check your Firestore security rules in the Firebase console. They may be too restrictive.");
        }
        throw error;
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
