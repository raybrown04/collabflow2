import { getFunctions, httpsCallable } from "firebase/functions";
import { User } from "firebase/auth";

const functions = getFunctions(); // Assumes Firebase app is initialized elsewhere

// --- Function Callers ---

/**
 * Calls the createInvite Cloud Function.
 * Should only be callable from an admin interface.
 */
const createInvite = async (email: string, role: 'User' | 'Administrator'): Promise<{ success: boolean; inviteCode?: string; message: string }> => {
  try {
    const createInviteFunction = httpsCallable(functions, 'createInvite');
    const result = await createInviteFunction({ email, role });
    return result.data as { success: boolean; inviteCode?: string; message: string };
  } catch (error: any) {
    console.error("Error calling createInvite function:", error);
    return { success: false, message: error.message || "Failed to create invite." };
  }
};

/**
 * Calls the verifyAndAcceptInvite Cloud Function.
 * Typically called after a user signs up using an invite code/link.
 */
const verifyAndAcceptInvite = async (inviteCode: string, newUser: User): Promise<{ success: boolean; role?: string; message: string }> => {
   if (!newUser || !newUser.uid || !newUser.email) {
        return { success: false, message: "Invalid user data provided." };
   }
   try {
    const verifyInviteFunction = httpsCallable(functions, 'verifyAndAcceptInvite');
    const result = await verifyInviteFunction({
        inviteCode: inviteCode,
        newUserUid: newUser.uid,
        newUserEmail: newUser.email
    });
    return result.data as { success: boolean; role?: string; message: string };
  } catch (error: any) {
    console.error("Error calling verifyAndAcceptInvite function:", error);
    return { success: false, message: error.message || "Failed to verify invite code." };
  }
};


// --- Invite Link Handling (Example) ---

/**
 * Extracts invite code from URL query parameters.
 * Assumes the invite link looks like: https://yourapp.com/signup?invite=<code>
 */
const getInviteCodeFromURL = (): string | null => {
  if (typeof window === 'undefined') return null; // Ensure runs on client-side
  const params = new URLSearchParams(window.location.search);
  return params.get("invite");
};


export {
  createInvite,
  verifyAndAcceptInvite,
  getInviteCodeFromURL,
};
