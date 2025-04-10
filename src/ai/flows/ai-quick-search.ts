'use server';
/**
 * @fileOverview AI Quick Search flow for administrators.
 *
 * - aiQuickSearch - A function that handles the AI quick search process.
 * - AiQuickSearchInput - The input type for the aiQuickSearch function.
 * - AiQuickSearchOutput - The return type for the aiQuickSearch function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getAppleEmails, Email as AppleEmail} from '@/services/apple-mail';
import {getOutlookEmails, Email as OutlookEmail} from '@/services/microsoft-outlook';
import {getEmails, Email as GmailEmail} from '@/services/gmail';
import {getDropboxFiles, DropboxFile} from '@/services/dropbox';
import {getAppleCalendarEvents, CalendarEvent as AppleCalendarEvent} from '@/services/apple-calendar';
import {getMicrosoftCalendarEvents, CalendarEvent as MicrosoftCalendarEvent} from '@/services/microsoft-calendar';
import {getCalendarEvents, CalendarEvent as GoogleCalendarEvent} from '@/services/google-calendar';

const AiQuickSearchInputSchema = z.object({
  userId: z.string().describe('The ID of the user performing the search.'),
  query: z.string().describe('The search query.'),
});
export type AiQuickSearchInput = z.infer<typeof AiQuickSearchInputSchema>;

const AiQuickSearchOutputSchema = z.object({
  results: z.array(z.object({
    type: z.string().describe('The type of the result (email, document, task, calendar event).'),
    source: z.string().describe('The source of the result (e.g., Gmail, Dropbox, CollabFlow).'),
    title: z.string().describe('The title of the result.'),
    description: z.string().describe('A short description of the result.'),
    link: z.string().describe('A link to the full result within CollabFlow.'),
  })).describe('The search results.'),
});
export type AiQuickSearchOutput = z.infer<typeof AiQuickSearchOutputSchema>;

export async function aiQuickSearch(input: AiQuickSearchInput): Promise<AiQuickSearchOutput> {
  return aiQuickSearchFlow(input);
}

const searchPrompt = ai.definePrompt({
  name: 'aiQuickSearchPrompt',
  input: {
    schema: z.object({
      query: z.string().describe('The search query.'),
      emails: z.array(z.object({
        id: z.string(),
        sender: z.string(),
        subject: z.string(),
        body: z.string(),
      })).describe('A list of emails to search through.'),
      dropboxFiles: z.array(z.object({
        id: z.string(),
        name: z.string(),
        path: z.string(),
      })).describe('A list of Dropbox files to search through.'),
      calendarEvents: z.array(z.object({
        id: z.string(),
        title: z.string(),
        startTime: z.date(),
        endTime: z.date(),
      })).describe('A list of calendar events to search through.'),
    }),
  },
  output: {
    schema: z.object({
      results: z.array(z.object({
        type: z.string().describe('The type of the result (email, document, task, calendar event).'),
        source: z.string().describe('The source of the result (e.g., Gmail, Dropbox, CollabFlow).'),
        title: z.string().describe('The title of the result.'),
        description: z.string().describe('A short description of the result.'),
        link: z.string().describe('A link to the full result within CollabFlow.'),
      })).describe('The search results.'),
    }),
  },
  prompt: `You are an AI assistant helping an administrator find information across different sources.

  The administrator is looking for: {{{query}}}

  Here are some emails:
  {{#each emails}}
  - Sender: {{{sender}}}, Subject: {{{subject}}}, Body: {{{body}}}
  {{/each}}

  Here are some Dropbox files:
  {{#each dropboxFiles}}
  - Name: {{{name}}}, Path: {{{path}}}
  {{/each}}

  Here are some calendar events:
  {{#each calendarEvents}}
  - Title: {{{title}}}, Start Time: {{{startTime}}}, End Time: {{{endTime}}}
  {{/each}}

  Based on the information provided, find the most relevant results and provide a short description and a link to the full result within CollabFlow.
  Ensure that the results are relevant to the query. For each result, describe the type, source, title, description and link.

  Results should be formatted as a JSON array of objects like this:
  {
    "results": [
      {
        "type": "email",
        "source": "Gmail",
        "title": "Project Update",
        "description": "An email from John about the latest project update.",
        "link": "/email/123"
      }
    ]
  }
  `,
});

const aiQuickSearchFlow = ai.defineFlow<
  typeof AiQuickSearchInputSchema,
  typeof AiQuickSearchOutputSchema
>({
  name: 'aiQuickSearchFlow',
  inputSchema: AiQuickSearchInputSchema,
  outputSchema: AiQuickSearchOutputSchema,
}, async input => {
  const gmailEmails: GmailEmail[] = await getEmails(input.userId);
  const outlookEmails: OutlookEmail[] = await getOutlookEmails(input.userId);
  const appleEmails: AppleEmail[] = await getAppleEmails(input.userId);
  const allEmails = [...gmailEmails, ...outlookEmails, ...appleEmails];

  const dropboxFiles: DropboxFile[] = await getDropboxFiles(input.userId);

  const googleCalendarEvents: GoogleCalendarEvent[] = await getCalendarEvents(input.userId);
  const microsoftCalendarEvents: MicrosoftCalendarEvent[] = await getMicrosoftCalendarEvents(input.userId);
  const appleCalendarEvents: AppleCalendarEvent[] = await getAppleCalendarEvents(input.userId);
  const allCalendarEvents = [...googleCalendarEvents, ...microsoftCalendarEvents, ...appleCalendarEvents];

  const {output} = await searchPrompt({
    query: input.query,
    emails: allEmails,
    dropboxFiles: dropboxFiles,
    calendarEvents: allCalendarEvents,
  });
  return output!;
});

