
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Send, Loader2, HeartHandshake, GraduationCap, ArrowLeft, Users, MessageSquareQuote, PartyPopper } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { ProposalEventType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { addProposal } from '@/services/proposals';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/user-context';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  goals: z.string().min(1, 'Goals are required.'),
  resources: z.string(),
  targetAudience: z.string(),
});

const eventTypes: { name: ProposalEventType, icon: React.ElementType, description: string, colorVar: string }[] = [
    { name: 'Social Event', icon: PartyPopper, description: 'Engage the community with fun, informal gatherings.', colorVar: 'hsl(var(--chart-1))' },
    { name: 'Service Event', icon: HeartHandshake, description: 'Make a positive impact with volunteer-based activities.', colorVar: 'hsl(var(--chart-2))' },
    { name: 'Academic Event', icon: GraduationCap, description: 'Foster learning with workshops, lectures, or study groups.', colorVar: 'hsl(var(--chart-3))' },
    { name: 'Colloquium', icon: MessageSquareQuote, description: 'Share knowledge and interests through discussions and activities.', colorVar: 'hsl(var(--chart-4))' },
];


export default function NewProposalPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { profile } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState<ProposalEventType | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      goals: '',
      resources: '',
      targetAudience: '',
    },
  });

  function selectEventType(type: ProposalEventType) {
    setEventType(type);
    setStep(2);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!eventType || !profile) return;
    setIsSubmitting(true);
    try {
      const plainValues = { ...values, eventType };
      
      await addProposal(plainValues, profile.name);
      
      toast({
        title: "Proposal Submitted!",
        description: "Your proposal is now under review. Thank you for your contribution!",
      });
      form.reset();
      router.push('/proposals');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Could not submit your proposal. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 1) {
      return (
          <Card className="max-w-3xl mx-auto">
              <CardHeader className="text-center">
                  <CardTitle className="font-headline text-2xl">Submit a New Proposal</CardTitle>
                  <CardDescription>
                      To get started, please select the type of event you are proposing.
                  </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                  {eventTypes.map(({ name, icon: Icon, description, colorVar }) => (
                      <button
                          key={name}
                          onClick={() => selectEventType(name)}
                          className={cn(
                            "p-4 border-2 rounded-lg text-left transition-all duration-300 group hover:shadow-lg",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "bg-card hover:border-[var(--type-color)]"
                          )}
                          style={{'--type-color': colorVar} as React.CSSProperties}
                      >
                          <div className="flex items-center gap-6">
                              <div className={cn("flex h-16 w-16 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-[var(--type-color)]")}>
                                <Icon className={cn("h-8 w-8 transition-colors text-[var(--type-color)] group-hover:text-accent-foreground")} />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">{name}</h3>
                                <p className="text-sm text-muted-foreground">{description}</p>
                              </div>
                          </div>
                      </button>
                  ))}
              </CardContent>
          </Card>
      )
  }

  const selectedEventTypeDetails = eventTypes.find(e => e.name === eventType);
  const SelectedIcon = selectedEventTypeDetails?.icon || Users;
  const selectedColor = selectedEventTypeDetails?.colorVar || 'hsl(var(--primary))';

  return (
    <Card 
        className="max-w-3xl mx-auto"
        style={{'--proposal-accent': selectedColor} as React.CSSProperties}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                    <SelectedIcon className="h-6 w-6 text-[var(--proposal-accent)]" />
                    New {eventType} Proposal
                </CardTitle>
                <CardDescription>
                Share your idea by filling out the form below.
                </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Community Park Cleanup Day" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide a detailed description of your event or project." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goals</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What are the main objectives?" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Requirements</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Volunteers, funding, equipment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., All residents, families with children" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full sm:w-auto bg-[var(--proposal-accent)] hover:opacity-90"
            >
              {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  <Send className="mr-2 h-4 w-4" />
              )}
              Submit Proposal
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
