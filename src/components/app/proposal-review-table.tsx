'use client';

import { useState } from 'react';
import type { Proposal } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';

interface ProposalReviewTableProps {
    initialProposals: Proposal[];
}

const statusConfig: Record<Proposal['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'Approved': { variant: 'secondary' },
    'In Progress': { variant: 'default' },
    'Completed': { variant: 'secondary' },
    'Rejected': { variant: 'destructive' },
    'Under Review': { variant: 'outline' },
};

export function ProposalReviewTable({ initialProposals }: ProposalReviewTableProps) {
    const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
    const { toast } = useToast();

    const handleStatusChange = (proposalId: string, newStatus: Proposal['status']) => {
        setProposals(currentProposals =>
            currentProposals.map(p =>
                p.id === proposalId ? { ...p, status: newStatus } : p
            )
        );
        toast({
            title: `Proposal ${newStatus}`,
            description: `The proposal has been successfully updated.`,
        });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Proposal Title</TableHead>
                    <TableHead className="hidden md:table-cell">Submitted By</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                        <TableCell className="font-medium">{proposal.title}</TableCell>
                        <TableCell className="hidden md:table-cell">{proposal.submittedBy}</TableCell>
                        <TableCell className="hidden sm:table-cell">{proposal.submittedDate}</TableCell>
                        <TableCell>
                             <Badge variant={statusConfig[proposal.status].variant}>
                                {proposal.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleStatusChange(proposal.id, 'Approved')} disabled={proposal.status === 'Approved'}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(proposal.id, 'Rejected')} disabled={proposal.status === 'Rejected'}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
