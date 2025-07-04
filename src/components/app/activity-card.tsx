import Image from 'next/image';
import { Users, Star } from 'lucide-react';

import type { Activity } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ActivityCard({ activity }: { activity: Activity }) {
  const { title, type, description, date, image, attendance, participation, feedbackScore, aiHint } = activity;
  const engagementCount = type === 'Event' ? attendance : participation;
  const engagementLabel = type === 'Event' ? 'Attendees' : 'Participants';

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          data-ai-hint={aiHint}
        />
        <Badge 
          variant={type === 'Event' ? 'destructive' : 'secondary'} 
          className="absolute top-3 right-3"
        >
          {type}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{date}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-4 mt-auto bg-card">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span>{engagementCount} {engagementLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span>{feedbackScore} Feedback</span>
        </div>
      </CardFooter>
    </Card>
  );
}
