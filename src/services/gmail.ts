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
export async function getEmails(userId: string): Promise<Email[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '9',
      sender: 'john@example.com',
      subject: 'Project Update',
      body: 'Please review the latest project update.',
    },
    {
      id: '10',
      sender: 'jane@example.com',
      subject: 'Meeting Reminder',
      body: 'Reminder for the upcoming meeting.',
    },
  ];
}
