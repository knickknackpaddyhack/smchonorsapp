'use server';

import { doc, getDoc, setDoc, collection, getDocs, writeBatch, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import type { UserProfile, Engagement } from '@/lib/types';
import { engagements as seedEngagementsData } from '@/lib/data';

const USER_ID = 'user123'; // Hardcoded for demo purposes

async function seedUserEngagements() {
    if (!isFirebaseConfigured) return;

    const engagementsColRef = collection(db!, 'users', USER_ID, 'engagements');
    const engagementsSnap = await getDocs(engagementsColRef);

    if (!engagementsSnap.empty) {
        return; // Data already exists
    }

    console.log("Seeding engagement data for demo user...");
    const batch = writeBatch(db!);
    let totalPoints = 0;

    seedEngagementsData.forEach(engagement => {
        const { id, ...engagementData } = engagement;
        const engagementRef = doc(engagementsColRef, id);
        batch.set(engagementRef, engagementData);
        totalPoints += engagement.points;
    });

    const userRef = doc(db!, 'users', USER_ID);
    batch.update(userRef, { honorsPoints: totalPoints });
    
    await batch.commit();
}


export async function getUserProfile(): Promise<UserProfile | null> {
    if (!isFirebaseConfigured) {
        return {
            id: USER_ID,
            name: 'Community Member',
            email: 'member@email.com (offline)',
            joinedDate: 'January 1, 2023',
            honorsPoints: 75
        };
    }
    
    try {
        const userRef = doc(db!, 'users', USER_ID);
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

export async function createUserProfile(profileData: Pick<UserProfile, 'name' | 'email'>): Promise<void> {
    if (!isFirebaseConfigured) {
        throw new Error(`Firebase not configured. Missing keys: ${missingKeys.join(',')}. Please check your .env file.`);
    }
    try {
        const userRef = doc(db!, 'users', USER_ID);
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
        await seedUserEngagements(); // Seed engagements for the new user
    } catch (error) {
        console.error("Error creating user profile:", error);
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Permission denied'))) {
            throw new Error("Creation failed: Permission denied. Please check your Firestore security rules.");
        }
        throw new Error("Failed to create profile.");
    }
}


export async function updateUserProfile(profileData: Partial<Omit<UserProfile, 'id'>>): Promise<void> {
   if (!isFirebaseConfigured) {
     throw new Error(`Firebase not configured. Missing keys: ${missingKeys.join(', ')}. Please check your root .env file.`);
   }
   try {
    const userRef = doc(db!, 'users', USER_ID);
    await updateDoc(userRef, profileData);
   } catch (error) {
     console.error("Error updating user profile:", error);
     throw new Error("Failed to update profile.");
   }
}

export async function getUserEngagements(): Promise<Engagement[]> {
    if (!isFirebaseConfigured) {
        return seedEngagementsData;
    }

    try {
        await seedUserEngagements();
        const engagementsColRef = collection(db!, 'users', USER_ID, 'engagements');
        const querySnapshot = await getDocs(engagementsColRef);
        const engagements = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Engagement));
        
        return engagements.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (isNaN(dateA)) return 1; // Put invalid dates at the end
            if (isNaN(dateB)) return -1;
            return dateB - dateA;
        });
    } catch (error) {
        console.error("Error fetching engagements:", error);
        return []; // Return empty on error
    }
}
