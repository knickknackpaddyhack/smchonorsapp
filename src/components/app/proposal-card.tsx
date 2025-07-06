import type { Proposal, ProposalEventType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, PartyPopper, HeartHandshake, GraduationCap, Presentation } from 'lucide-react';

const statusConfig: Record<Proposal['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon?: React.ElementType }> = {
    'Approved': { variant: 'secondary' },
    'In Progress': { variant: 'default' },
    'Completed': { variant: 'secondary', icon: CheckCircle2 },
    'Rejected': { variant: 'destructive' },
    'Under Review': { variant: 'outline' },
}

const eventTypeConfig: Record<ProposalEventType, { icon: React.ElementType, color: string }> = {
    'Social Event': { icon: PartyPopper, color: 'text-chart-1' },
    'Service Event': { icon: HeartHandshake, color: 'text-chart-2' },
    'Academic Event': { icon: GraduationCap, color: 'text-chart-3' },
    'Colloquium': { icon: Presentation, color: 'text-chart-4' },
};

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const config = statusConfig[proposal.status];
  const EventIcon = eventTypeConfig[proposal.eventType]?.icon || PartyPopper;
  const iconColor = eventTypeConfig[proposal.eventType]?.color || 'text-muted-foreground';

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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <EventIcon className={`h-4 w-4 ${iconColor}`} />
            <span>{proposal.eventType}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <p className="text-sm text-muted-foreground">{proposal.description}</p>
        <div>
          <h4 className="font-semibold text-sm">Goals</h4>
          <p className="text-sm text-muted-foreground">{proposal.goals}</p>
        </div>
      </CardContent>
      <CardFooter className="mt-auto border-t pt-4 text-xs text-muted-foreground">
        <div className="flex-1">
            <span className="font-semibold">Audience:</span> {proposal.targetAudience}
        </div>
         <div className="flex-1 text-right">
            <span className="font-semibold">Resources:</span> {proposal.resources}
        </div>
      </CardFooter>
    </Card>
  );
}
