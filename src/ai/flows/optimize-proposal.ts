'use server';

/**
 * @fileOverview AI-powered tool that analyzes user proposals and engagement data,
 * generating suggestions for optimal alignment of proposals with user interests and community needs.
 *
 * - optimizeProposal - A function that handles the proposal optimization process.
 * - OptimizeProposalInput - The input type for the optimizeProposal function.
 * - OptimizeProposalOutput - The return type for the optimizeProposal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeProposalInputSchema = z.object({
  proposalText: z
    .string()
    .describe('The text of the event or project proposal.'),
  userEngagementData: z
    .string()
    .describe(
      'A summary of the user engagement data, including past activities, interests, and feedback scores.'
    ),
  communityNeeds: z
    .string()
    .describe(
      'A description of the current needs and interests of the community.'
    ),
});
export type OptimizeProposalInput = z.infer<typeof OptimizeProposalInputSchema>;

const OptimizeProposalOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of suggestions for optimizing the proposal to better align with community interests and increase its chances of being accepted.'
    ),
  revisedProposal: z
    .string()
    .describe('A revised version of the proposal incorporating the suggestions.'),
});
export type OptimizeProposalOutput = z.infer<typeof OptimizeProposalOutputSchema>;

export async function optimizeProposal(input: OptimizeProposalInput): Promise<OptimizeProposalOutput> {
  return optimizeProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeProposalPrompt',
  input: {schema: OptimizeProposalInputSchema},
  output: {schema: OptimizeProposalOutputSchema},
  prompt: `You are an AI-powered tool that analyzes user proposals and engagement data to provide suggestions for optimizing proposals.

Analyze the following proposal, user engagement data, and community needs, and provide suggestions for optimizing the proposal to better align with community interests and increase its chances of being accepted. Also, provide a revised version of the proposal incorporating the suggestions.

Proposal:
{{proposalText}}

User Engagement Data:
{{userEngagementData}}

Community Needs:
{{communityNeeds}}`,
});

const optimizeProposalFlow = ai.defineFlow(
  {
    name: 'optimizeProposalFlow',
    inputSchema: OptimizeProposalInputSchema,
    outputSchema: OptimizeProposalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
