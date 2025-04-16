/**
 * Represents a file in Dropbox.
 */
export interface DropboxFile {
  /**
   * The ID of the file.
   */
id: string;
  /**
   * The name of the file.
   */
name: string;
  /**
   * The path to the file.
   */
  path: string;
}

/**
 * Asynchronously retrieves files from Dropbox for a user.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of DropboxFile objects.
 */
export async function getDropboxFiles(userId: string): Promise<DropboxFile[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '7',
      name: 'Document1.pdf',
      path: '/Documents/Document1.pdf',
    },
    {
      id: '8',
      name: 'Image2.jpg',
      path: '/Images/Image2.jpg',
    },
  ];
}
