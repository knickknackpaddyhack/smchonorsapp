'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProposalReviewTable } from "@/components/app/proposal-review-table";
import { Shield, Loader2 } from 'lucide-react';
import { getProposals } from '@/services/proposals';
import type { Proposal } from '@/lib/types';

export default function AdminPage() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProposals = useCallback(async () => {
        // Keep loading true while fetching
        const fetchedProposals = await getProposals();
        setProposals(fetchedProposals);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    const handleUpdate = () => {
      setIsLoading(true);
      fetchProposals();
    }

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-headline">Admin Dashboard</h2>
                    <p className="text-muted-foreground">
                        Review and manage event proposals.
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Proposal Review
                    </CardTitle>
                    <CardDescription>
                        Approve or reject proposals submitted by community members.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <ProposalReviewTable proposals={proposals} onUpdate={handleUpdate} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
