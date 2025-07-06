
'use server';

import { doc, getDoc, setDoc, collection, getDocs, writeBatch, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import type { UserProfile, Engagement } from '@/lib/types';
import { engagements as seedEngagementsData } from '@/lib/data';

async function seedInitialUserEngagements(uid: string): Promise<number> {
    if (!isFirebaseConfigured) return 0;

    const engagementsColRef = collection(db!, 'users', uid, 'engagements');
    
    try {
        console.log("Seeding engagement data for new user...");
        const batch = writeBatch(db!);
        let totalPoints = 0;

        seedEngagementsData.forEach(engagement => {
            const { id, ...engagementData } = engagement;
            const engagementRef = doc(engagementsColRef, id);
            batch.set(engagementRef, engagementData);
            totalPoints += engagement.points;
        });
        
        await batch.commit();
        return totalPoints;
    } catch(error) {
        console.error("Error seeding user engagements:", error);
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Permission denied'))) {
            throw new Error("Profile creation failed while saving initial data. This is likely due to restrictive Firestore security rules for subcollections (e.g., /users/{userId}/engagements).");
        }
        throw new Error("Failed to seed initial user data.");
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

        const initialPoints = await seedInitialUserEngagements(uid);

        const newProfile: UserProfile = {
            id: uid,
            name: profileData.name,
            email: profileData.email,
            photoURL: profileData.photoURL || '',
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            honorsPoints: initialPoints,
        };
        
        const { id, ...profileToSave } = newProfile;
        await setDoc(userRef, profileToSave);

        return newProfile;
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
