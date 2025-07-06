'use server';

import { collection, doc, getDocs, setDoc, writeBatch, getDoc, addDoc, serverTimestamp, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import type { Proposal } from '@/lib/types';
import { proposals as seedProposals } from '@/lib/data';

const USER_NAME = 'Community Member'; // Hardcoded for demo purposes

// A function to check and seed data for proposals if they don't exist.
async function seedInitialProposals() {
    if (!isFirebaseConfigured) return; // Firebase not configured

    const proposalsColRef = collection(db!, 'proposals');
    const proposalsSnap = await getDocs(proposalsColRef);

    if (!proposalsSnap.empty) {
        return; // Data already exists
    }

    console.log("Seeding proposals data...");

    const batch = writeBatch(db!);
    seedProposals.forEach(proposal => {
        const { id, ...proposalData } = proposal;
        const proposalRef = doc(proposalsColRef, id);
        batch.set(proposalRef, proposalData);
    });

    await batch.commit();
}

export async function getProposals(): Promise<Proposal[]> {
    if (!isFirebaseConfigured) {
        return seedProposals;
    }
    
    try {
        await seedInitialProposals(); // Seed data if collection is empty
        const proposalsColRef = collection(db!, 'proposals');
        const q = query(proposalsColRef, orderBy('submittedDate', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Proposal));
    } catch (error) {
        console.error("Error fetching proposals:", error);
        return [];
    }
}

type NewProposalData = Omit<Proposal, 'id' | 'status' | 'submittedBy' | 'submittedDate'>;

export async function addProposal(proposalData: NewProposalData): Promise<void> {
    if (!isFirebaseConfigured) {
        throw new Error(`Firebase not configured. Missing keys: ${missingKeys.join(', ')}. Please check your root .env file.`);
    }
    try {
        const proposalsColRef = collection(db!, 'proposals');
        const newProposalDoc = {
            title: proposalData.title,
            description: proposalData.description,
            goals: proposalData.goals,
            resources: proposalData.resources,
            targetAudience: proposalData.targetAudience,
            status: 'Under Review' as const,
            submittedBy: USER_NAME,
            submittedDate: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        };
        await addDoc(proposalsColRef, newProposalDoc);
    } catch (error) {
        console.error("--- DETAILED FIREBASE ERROR ---");
        console.error(error);
        console.error("-------------------------------");
        
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Permission denied'))) {
             throw new Error("Submission failed: Permission denied. Please check your Firestore security rules in the Firebase console.");
        } else if (error instanceof Error) {
            throw new Error(`Submission failed due to a server error: ${error.message}`);
        }
        
        throw new Error("An unknown error occurred while adding the proposal. Check server logs for details.");
    }
}


export async function updateProposalStatus(proposalId: string, status: Proposal['status']): Promise<void> {
    if (!isFirebaseConfigured) {
        console.warn("Update failed: Firebase not configured.");
        return;
    }
    try {
        const proposalRef = doc(db!, 'proposals', proposalId);
        await updateDoc(proposalRef, { status });
    } catch (error) {
        console.error("Error updating proposal status:", error);
        throw new Error("Failed to update proposal status.");
    }
}
