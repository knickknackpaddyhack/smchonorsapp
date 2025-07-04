import type { Proposal } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const statusConfig: Record<Proposal['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon?: React.ElementType }> = {
    'Approved': { variant: 'secondary' },
    'In Progress': { variant: 'default' },
    'Completed': { variant: 'secondary', icon: CheckCircle2 },
    'Rejected': { variant: 'destructive' },
    'Under Review': { variant: 'outline' },
}

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const config = statusConfig[proposal.status];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="font-headline text-lg">{proposal.title}</CardTitle>
            <Badge variant={config.variant} className="whitespace-nowrap flex-shrink-0">
                {config.icon && <config.icon className="mr-1 h-3 w-3" />}
                {proposal.status}
            </Badge>
        </div>
        <CardDescription>For: {proposal.targetAudience}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <p className="text-sm text-muted-foreground">{proposal.description}</p>
        <div>
          <h4 className="font-semibold text-sm">Goals</h4>
          <p className="text-sm text-muted-foreground">{proposal.goals}</p>
        </div>
      </CardContent>
      <CardFooter className="mt-auto border-t pt-4">
        <p className="text-xs text-muted-foreground">Resources: {proposal.resources}</p>
      </CardFooter>
    </Card>
  );
}
