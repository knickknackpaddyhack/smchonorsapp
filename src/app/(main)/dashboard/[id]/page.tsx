import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Users, Star, Calendar } from 'lucide-react';

import { activities } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ActivityDetailsPage({ params }: { params: { id: string } }) {
  const activity = activities.find((a) => a.id === params.id);

  if (!activity) {
    notFound();
  }

  const { title, type, description, date, image, attendance, participation, feedbackScore, aiHint } = activity;
  const engagementCount = type === 'Event' ? attendance : participation;
  const engagementLabel = type === 'Event' ? 'Attendees' : 'Participants';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="overflow-hidden">
        <div className="relative h-64 md:h-80 w-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            data-ai-hint={aiHint}
          />
        </div>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <Badge variant={type === 'Event' ? 'destructive' : 'secondary'} className="mb-2">{type}</Badge>
                    <CardTitle className="font-headline text-3xl">{title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">About this activity</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold text-lg mb-4 text-foreground">Engagement Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-4 bg-secondary/30">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{engagementCount}</p>
                                <p className="text-sm text-muted-foreground">{engagementLabel}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 bg-secondary/30">
                        <div className="flex items-center gap-3">
                             <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-amber-500/10 text-amber-600">
                                <Star className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{feedbackScore}</p>
                                <p className="text-sm text-muted-foreground">Feedback Score</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
