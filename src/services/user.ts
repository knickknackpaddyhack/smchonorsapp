
'use server';

import { doc, getDoc, setDoc, collection, getDocs, writeBatch, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import type { UserProfile, Engagement } from '@/lib/types';
import { engagements as seedEngagementsData } from '@/lib/data';

async function seedUserEngagements(uid: string) {
    if (!isFirebaseConfigured) return;

    const engagementsColRef = collection(db!, 'users', uid, 'engagements');
    
    console.log("Seeding engagement data for new user...");
    const batch = writeBatch(db!);
    let totalPoints = 0;

    seedEngagementsData.forEach(engagement => {
        const { id, ...engagementData } = engagement;
        const engagementRef = doc(engagementsColRef, id);
        batch.set(engagementRef, engagementData);
        totalPoints += engagement.points;
    });

    const userRef = doc(db!, 'users', uid);
    batch.update(userRef, { honorsPoints: totalPoints });
    
    await batch.commit();
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured) {
        // This case is for local development without firebase credentials.
        // It should not be hit if firebase is configured.
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

export async function createUserProfile(uid: string, profileData: Pick<UserProfile, 'name' | 'email'>): Promise<void> {
    if (!isFirebaseConfigured) {
        throw new Error(`Firebase not configured. Missing keys: ${missingKeys.join(',')}. Please check your .env file.`);
    }
    try {
        const userRef = doc(db!, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            throw new Error("User profile already exists.");
        }

        const newProfile: Omit<UserProfile, 'id'> = {
            name: profileData.name,
            email: profileData.email,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            honorsPoints: 0,
        };
        await setDoc(userRef, newProfile);
        await seedUserEngagements(uid); // Seed engagements for the new user
    } catch (error) {
        console.error("Error creating user profile:", error);
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Permission denied'))) {
            throw new Error("Creation failed: Permission denied. Please check your Firestore security rules.");
        }
        throw new Error("Failed to create profile.");
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
