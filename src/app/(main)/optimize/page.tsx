'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sparkles, Loader2, Lightbulb, Clipboard } from 'lucide-react';
import { optimizeProposal, OptimizeProposalOutput } from '@/ai/flows/optimize-proposal';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  proposalText: z.string().min(50, 'Proposal text must be at least 50 characters.'),
  userEngagementData: z.string().min(20, 'Please provide a summary of user engagement.'),
  communityNeeds: z.string().min(20, 'Please describe the community needs.'),
});

export default function OptimizePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizeProposalOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proposalText: '',
      userEngagementData: 'Recent popular activities include outdoor events (gardening, sports) and tech workshops for youth. Feedback scores are highest for hands-on, collaborative projects.',
      communityNeeds: 'There is a demand for more family-friendly weekend activities and programs that address environmental sustainability.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const optimizationResult = await optimizeProposal(values);
      setResult(optimizationResult);
    } catch (error) {
      console.error('Optimization failed:', error);
      toast({
        variant: 'destructive',
        title: 'Optimization Failed',
        description: 'An error occurred while optimizing your proposal. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to clipboard!",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Proposal Optimization Tool
          </CardTitle>
          <CardDescription>
            Use our AI-powered tool to analyze your proposal and get suggestions for improvement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="proposalText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Proposal Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste your full proposal here..." {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userEngagementData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Engagement Data</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="communityNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Community Needs</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Optimize Proposal
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {isLoading && (
         <Card>
            <CardContent className="p-6 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">AI is thinking... this may take a moment.</p>
            </CardContent>
         </Card>
      )}
      {result && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Optimization Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Suggestions for Improvement</h3>
              <div className="text-sm max-w-none text-muted-foreground whitespace-pre-wrap">{result.suggestions}</div>
            </div>
            <Separator />
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Revised Proposal</h3>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.revisedProposal)}>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy
                    </Button>
                </div>
              <div className="text-sm max-w-none text-muted-foreground p-4 border rounded-md bg-background whitespace-pre-wrap">{result.revisedProposal}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
