/**
 * Represents a calendar event.
 */
export interface CalendarEvent {
  /**
   * The ID of the event.
   */
id: string;
  /**
   * The title of the event.
   */
title: string;
  /**
   * The start time of the event.
   */
  startTime: Date;
  /**
   * The end time of the event.
   */
  endTime: Date;
}

/**
 * Asynchronously retrieves calendar events for a user.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of CalendarEvent objects.
 */
export async function getMicrosoftCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '3',
      title: 'Meeting with Jane',
      startTime: new Date(),
      endTime: new Date(),
    },
    {
      id: '4',
      title: 'Hackathon',
      startTime: new Date(),
      endTime: new Date(),
    },
  ];
}
