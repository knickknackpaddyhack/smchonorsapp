'use client';

import Link from 'next/link';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProposals } from '@/services/proposals';
import { ProposalCard } from '@/components/app/proposal-card';
import type { Proposal } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const proposalStatuses: Proposal['status'][] = ['Under Review', 'Approved', 'In Progress', 'Completed', 'Rejected'];

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProposals() {
      setIsLoading(true);
      const fetchedProposals = await getProposals();
      setProposals(fetchedProposals);
      setIsLoading(false);
    }
    fetchProposals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-headline">Event Proposals</h2>
          <p className="text-muted-foreground">
            Track submitted proposals and their current status.
          </p>
        </div>
        <Link href="/proposals/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="Under Review" className="w-full">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList>
              {proposalStatuses.map((status) => (
                <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {proposalStatuses.map((status) => {
            const filteredProposals = proposals.filter(p => p.status === status);
            return (
              <TabsContent key={status} value={status}>
                {filteredProposals.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {filteredProposals.map((proposal) => (
                      <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                ) : (
                  <div className="col-span-full text-center text-muted-foreground py-16">
                    <p className="font-semibold">No proposals found</p>
                    <p className="text-sm">There are currently no proposals with the status "{status}".</p>
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </div>
  );
}
