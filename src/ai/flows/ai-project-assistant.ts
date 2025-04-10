'use server';
/**
 * @fileOverview AI Project Assistant Flow for summarizing project progress, risks, and next steps.
 *
 * - aiProjectSummary - A function that generates a project summary.
 * - AIProjectSummaryInput - The input type for the aiProjectSummary function.
 * - AIProjectSummaryOutput - The return type for the aiProjectSummary function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getCalendarEvents} from '@/services/google-calendar';
import {getMicrosoftCalendarEvents} from '@/services/microsoft-calendar';
import {getAppleCalendarEvents} from '@/services/apple-calendar';
import {getDropboxFiles} from '@/services/dropbox';
import {getEmails} from '@/services/gmail';
import {getOutlookEmails} from '@/services/microsoft-outlook';
import {getAppleEmails} from '@/services/apple-mail';

const AIProjectSummaryInputSchema = z.object({
  projectId: z.string().describe('The ID of the project to summarize.'),
  userId: z.string().describe('The ID of the user requesting the summary.'),
});
export type AIProjectSummaryInput = z.infer<typeof AIProjectSummaryInputSchema>;

const AIProjectSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the project progress, key risks, and next steps.'),
});
export type AIProjectSummaryOutput = z.infer<typeof AIProjectSummaryOutputSchema>;

export async function aiProjectSummary(input: AIProjectSummaryInput): Promise<AIProjectSummaryOutput> {
  return aiProjectSummaryFlow(input);
}

const aiProjectSummaryPrompt = ai.definePrompt({
  name: 'aiProjectSummaryPrompt',
  input: {
    schema: z.object({
      projectId: z.string().describe('The ID of the project to summarize.'),
      userId: z.string().describe('The ID of the user requesting the summary.'),
      tasks: z.string().describe('A list of task names.'),
      emails: z.string().describe('A list of email subjects.'),
      documents: z.string().describe('A list of document names.'),
      calendarEvents: z.string().describe('A list of calendar event titles.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the project progress, key risks, and next steps.'),
    }),
  },
  prompt: `You are an AI Project Assistant, and will produce a summary of the project progress, key risks, and next steps, from this information:\n\nProject ID: {{{projectId}}}\nUser ID: {{{userId}}}\nTasks: {{{tasks}}}\nEmails: {{{emails}}}\nDocuments: {{{documents}}}\nCalendar Events: {{{calendarEvents}}}`,
});

const aiProjectSummaryFlow = ai.defineFlow<
  typeof AIProjectSummaryInputSchema,
  typeof AIProjectSummaryOutputSchema
>(
  {
    name: 'aiProjectSummaryFlow',
    inputSchema: AIProjectSummaryInputSchema,
    outputSchema: AIProjectSummaryOutputSchema,
  },
  async input => {
    // Fetch relevant data for the project
    const tasks = ['Task 1', 'Task 2', 'Task 3']; // Replace with actual task retrieval
    const emails = (await getEmails(input.userId)).map(email => email.subject);
    const outlookEmails = (await getOutlookEmails(input.userId)).map(email => email.subject);
    const appleEmails = (await getAppleEmails(input.userId)).map(email => email.subject);
    const documents = (await getDropboxFiles(input.userId)).map(file => file.name);
    const calendarEvents = (await getCalendarEvents(input.userId)).map(event => event.title);
    const microsoftCalendarEvents = (await getMicrosoftCalendarEvents(input.userId)).map(event => event.title);
    const appleCalendarEvents = (await getAppleCalendarEvents(input.userId)).map(event => event.title);

    const {
      output,
    } = await aiProjectSummaryPrompt({
      ...input,
      tasks: tasks.join(', '),
      emails: [...emails, ...outlookEmails, ...appleEmails].join(', '),
      documents: documents.join(', '),
      calendarEvents: [...calendarEvents, ...microsoftCalendarEvents, ...appleCalendarEvents].join(', '),
    });
    return output!;
  }
);
