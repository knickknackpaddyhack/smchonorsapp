import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { proposals } from "@/lib/data";
import { ProposalReviewTable } from "@/components/app/proposal-review-table";
import { Shield } from 'lucide-react';

export default function AdminPage() {
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
                    <ProposalReviewTable initialProposals={proposals} />
                </CardContent>
            </Card>
        </div>
    );
}
