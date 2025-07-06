'use client';

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
import { updateProposalStatus } from '@/services/proposals';

interface ProposalReviewTableProps {
    proposals: Proposal[];
    onUpdate: () => void;
}

const statusConfig: Record<Proposal['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'Approved': { variant: 'secondary' },
    'In Progress': { variant: 'default' },
    'Completed': { variant: 'secondary' },
    'Rejected': { variant: 'destructive' },
    'Under Review': { variant: 'outline' },
};

export function ProposalReviewTable({ proposals, onUpdate }: ProposalReviewTableProps) {
    const { toast } = useToast();

    const handleStatusChange = async (proposalId: string, newStatus: Proposal['status']) => {
        try {
            await updateProposalStatus(proposalId, newStatus);
            toast({
                title: `Proposal ${newStatus}`,
                description: `The proposal has been successfully updated.`,
            });
            onUpdate(); // Refresh the data in the parent component
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update proposal status. Please try again.',
            });
        }
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
