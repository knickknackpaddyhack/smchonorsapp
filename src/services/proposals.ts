'use server';

import { collection, doc, getDocs, setDoc, writeBatch, getDoc, addDoc, serverTimestamp, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Proposal } from '@/lib/types';
import { proposals as seedProposals } from '@/lib/data';

const USER_NAME = 'Community Member'; // Hardcoded for demo purposes

// A function to check and seed data for proposals if they don't exist.
async function seedInitialProposals() {
    if (!db) return; // Firebase not configured

    const proposalsColRef = collection(db, 'proposals');
    const proposalsSnap = await getDocs(proposalsColRef);

    if (!proposalsSnap.empty) {
        return; // Data already exists
    }

    console.log("Seeding proposals data...");

    const batch = writeBatch(db);
    seedProposals.forEach(proposal => {
        const { id, ...proposalData } = proposal;
        const proposalRef = doc(proposalsColRef, id);
        batch.set(proposalRef, proposalData);
    });

    await batch.commit();
}

export async function getProposals(): Promise<Proposal[]> {
    if (!db) {
        return seedProposals;
    }
    
    try {
        await seedInitialProposals(); // Seed data if collection is empty
        const proposalsColRef = collection(db, 'proposals');
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

type NewProposal = Omit<Proposal, 'id' | 'status' | 'submittedBy' | 'submittedDate'>;

export async function addProposal(proposalData: NewProposal): Promise<Proposal> {
    if (!db) {
        throw new Error("Cannot add proposal: Firebase not configured.");
    }
    try {
        const proposalsColRef = collection(db, 'proposals');
        const newProposalDoc = {
            ...proposalData,
            status: 'Under Review' as const,
            submittedBy: USER_NAME,
            submittedDate: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        };
        const docRef = await addDoc(proposalsColRef, newProposalDoc);
        return {
            id: docRef.id,
            ...newProposalDoc,
        };
    } catch (error) {
        console.error("Error adding proposal:", error);
        throw new Error("Failed to submit proposal.");
    }
}


export async function updateProposalStatus(proposalId: string, status: Proposal['status']): Promise<void> {
    if (!db) {
        console.warn("Update failed: Firebase not configured.");
        return;
    }
    try {
        const proposalRef = doc(db, 'proposals', proposalId);
        await updateDoc(proposalRef, { status });
    } catch (error) {
        console.error("Error updating proposal status:", error);
        throw new Error("Failed to update proposal status.");
    }
}
