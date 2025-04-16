/**
 * Represents an email.
 */
export interface Email {
  /**
   * The ID of the email.
   */
id: string;
  /**
   * The sender of the email.
   */
sender: string;
  /**
   * The subject of the email.
   */
  subject: string;
  /**
   * The body of the email.
   */
  body: string;
}

/**
 * Asynchronously retrieves emails for a user.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of Email objects.
 */
export async function getOutlookEmails(userId: string): Promise<Email[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '11',
      sender: 'Bob@example.com',
      subject: 'New Outlook Email',
      body: 'Please review the latest Outlook email.',
    },
    {
      id: '12',
      sender: 'Sally@example.com',
      subject: 'Outlook Meeting',
      body: 'Reminder for the upcoming Outlook meeting.',
    },
  ];
}
