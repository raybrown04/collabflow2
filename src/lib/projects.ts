// src/lib/projects.ts
import { getFunctions, httpsCallable, FunctionsErrorCode } from "firebase/functions";
import { app, auth } from "./auth"; // Assuming firebase app is initialized here
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

// Define the Project type based on Firestore schema
export interface Project {
  id: string; // Firestore document ID
  projectId: string; // ID stored within the document
  name: string;
  description?: string;
  members: string[]; // Array of UIDs
  createdBy: string; // UID of Admin creator
  createdAt: string; // ISO Date string (converted by cloud function)
  updatedAt: string; // ISO Date string (converted by cloud function)
}

// --- Firebase Functions --- //
// Consider making the region configurable if deploying to other regions
const functions = getFunctions(app, 'us-central1');

// Type for HttpsError details, if provided by the function
interface HttpsErrorDetails { 
  [key: string]: any; 
}

// Custom error class to hold more details
export class ProjectError extends Error {
  code: FunctionsErrorCode | string;
  details?: HttpsErrorDetails;

  constructor(message: string, code: FunctionsErrorCode | string = 'unknown', details?: HttpsErrorDetails) {
    super(message);
    this.name = 'ProjectError';
    this.code = code;
    this.details = details;
  }
}


// Callable function references
const createProjectFunction = httpsCallable<{
  name: string;
  description?: string;
  members: string[];
}, { success: boolean; projectId: string | null; message: string }>(
  functions,
  'createProject'
);

const getProjectsFunction = httpsCallable<{}, { success: boolean; projects: Project[]; message: string }>(
  functions,
  'getProjects'
);

const updateProjectFunction = httpsCallable<{
  projectId: string;
  updates: Partial<Omit<Project, 'id' | 'projectId' | 'createdBy' | 'createdAt' | 'updatedAt'>>;
}, { success: boolean; message: string }>(
  functions,
  'updateProject'
);

const deleteProjectFunction = httpsCallable<{ projectId: string }, { success: boolean; message: string }>(
  functions,
  'deleteProject'
);

// Helper to handle Firebase Function errors
function handleFirebaseError(error: any): ProjectError {
  console.error("Firebase Function call failed:", error);
  let code: FunctionsErrorCode | string = 'unknown';
  let message = "An unexpected error occurred.";
  let details: HttpsErrorDetails | undefined = undefined;

  // Check if it's a Firebase Functions HttpsError
  if (error.code && typeof error.code === 'string' && error.message && typeof error.message === 'string') {
      // Treat as HttpsError duck-typing
      code = error.code as FunctionsErrorCode; // Cast to FunctionsErrorCode for known codes
      message = error.message;
      details = error.details as HttpsErrorDetails;
  } else if (error instanceof Error) {
      message = error.message;
  }

  // Map common codes to more user-friendly messages if desired
  switch (code) {
    case 'unauthenticated':
      message = 'Authentication required. Please sign in.';
      break;
    case 'permission-denied':
      message = 'You do not have permission to perform this action.';
      break;
    case 'invalid-argument':
        message = `Invalid input: ${message}`; // Append original message detail
        break;
     case 'not-found':
        message = 'The requested project was not found.';
        break;
    // Add other common codes as needed
  }

  return new ProjectError(message, code, details);
}


// --- Frontend Helper Functions --- //

/**
 * Creates a new project.
 * Requires authenticated user with Administrator role.
 * @param name Project name
 * @param description Optional project description
 * @param members Array of member UIDs (must include current user if creating)
 * @returns The ID of the newly created project.
 * @throws Throws ProjectError if creation fails or user is not authorized.
 */
export const createProject = async (
  name: string,
  description: string = "",
  members: string[]
): Promise<string> => {
  try {
    const result = await createProjectFunction({ name, description, members });
    if (result.data.success && result.data.projectId) {
      return result.data.projectId;
    } else {
      // Use default message if function didn't provide one
      throw new ProjectError(result.data.message || "Failed to create project.", 'function-error');
    }
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
};

/**
 * Updates an existing project.
 * Requires authenticated user with Administrator role.
 * @param projectId ID of the project to update.
 * @param updates Object containing fields to update (e.g., { name, description, members }).
 * @returns Promise resolving when update is successful.
 * @throws Throws ProjectError if update fails or user is not authorized.
 */
export const updateProject = async (
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'projectId' | 'createdBy' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const result = await updateProjectFunction({ projectId, updates });
    if (!result.data.success) {
      throw new ProjectError(result.data.message || "Failed to update project.", 'function-error');
    }
  } catch (error: any) {
     throw handleFirebaseError(error);
  }
};

/**
 * Deletes a project.
 * Requires authenticated user with Administrator role.
 * @param projectId ID of the project to delete.
 * @returns Promise resolving when deletion is successful.
 * @throws Throws ProjectError if deletion fails or user is not authorized.
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const result = await deleteProjectFunction({ projectId });
    if (!result.data.success) {
      throw new ProjectError(result.data.message || "Failed to delete project.", 'function-error');
    }
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
};

// --- React Hook for Fetching Projects --- //

interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: ProjectError | null; // Use custom error type
  refetch: () => void; // Function to manually trigger refetch
}

/**
 * React hook to fetch projects for the currently logged-in user.
 * Automatically fetches projects on mount and when auth state changes.
 * Provides loading state, error handling, and a refetch function.
 * @returns {UseProjectsResult} Object containing projects, loading state, error, and refetch function.
 */
export const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ProjectError | null>(null);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [fetchTrigger, setFetchTrigger] = useState<number>(0); // State to trigger refetch

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Reset state when user logs out
      if (!currentUser) {
        setProjects([]);
        setLoading(false);
        setError(null);
      }
      setFetchTrigger(prev => prev + 1); // Trigger fetch on auth change
    });
    return () => unsubscribe();
  }, []);

  // Fetch projects when user is logged in or fetchTrigger changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setProjects([]); // Clear projects if user logs out
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ensure the user's token is fresh
        await user.getIdToken(true);
        const result = await getProjectsFunction(); // No args needed
        if (result.data.success) {
          setProjects(result.data.projects);
        } else {
          // Throw error if function reported failure
           throw new ProjectError(result.data.message || "Failed to fetch projects.", 'function-error');
        }
      } catch (err: any) {
         const projectError = handleFirebaseError(err);
        setError(projectError);
        setProjects([]); // Clear projects on error
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, fetchTrigger]); // Depend on user and fetchTrigger

  // Function to manually refetch projects
  const refetch = () => {
    // Ensure user is still logged in before refetching
    if(auth.currentUser) {
        setFetchTrigger(prev => prev + 1);
    }
  };

  return { projects, loading, error, refetch };
};
