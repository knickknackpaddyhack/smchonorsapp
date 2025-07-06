'use server';

import { doc, getDoc, setDoc, collection, getDocs, writeBatch, DocumentData, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, Engagement } from '@/lib/types';
import { engagements as seedEngagementsData } from '@/lib/data';

const USER_ID = 'user123'; // Hardcoded for demo purposes

// A function to check and seed data for the demo user if they don't exist.
async function seedUserData() {
    if (!db) return; // Firebase not configured

    const userRef = doc(db, 'users', USER_ID);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return; // Data already exists
    }

    console.log("Seeding data for demo user...");

    const batch = writeBatch(db);

    const initialProfile: Omit<UserProfile, 'id'> = {
        name: 'Community Member',
        email: 'member@email.com',
        joinedDate: 'January 1, 2023',
        honorsPoints: 0,
    };
    batch.set(userRef, initialProfile);
    
    let totalPoints = 0;
    const engagementsColRef = collection(db, 'users', USER_ID, 'engagements');
    seedEngagementsData.forEach(engagement => {
        const { id, ...engagementData } = engagement;
        const engagementRef = doc(engagementsColRef, id);
        batch.set(engagementRef, engagementData);
        totalPoints += engagement.points;
    });

    batch.update(userRef, { honorsPoints: totalPoints });

    await batch.commit();
}


export async function getUserProfile(): Promise<UserProfile | null> {
    if (!db) {
        return {
            id: USER_ID,
            name: 'Community Member',
            email: 'member@email.com (offline)',
            joinedDate: 'January 1, 2023',
            honorsPoints: 75
        };
    }
    
    try {
        await seedUserData();
        const userRef = doc(db, 'users', USER_ID);
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

export async function updateUserProfile(profileData: Partial<Omit<UserProfile, 'id'>>): Promise<void> {
   if (!db) {
     console.warn("Update failed: Firebase not configured.");
     return;
   }
   try {
    const userRef = doc(db, 'users', USER_ID);
    await updateDoc(userRef, profileData);
   } catch (error) {
     console.error("Error updating user profile:", error);
     throw new Error("Failed to update profile.");
   }
}

export async function getUserEngagements(): Promise<Engagement[]> {
    if (!db) {
        return seedEngagementsData;
    }

    try {
        const engagementsColRef = collection(db, 'users', USER_ID, 'engagements');
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
