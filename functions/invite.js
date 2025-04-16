const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid"); // Make sure uuid is installed

// ----- Firebase Admin SDK Initialization ----- //
// Initialize Firebase Admin SDK. Cloud Functions automatically loads
// the credentials in deployed environments. For local development,
// ensure you've set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
// See: https://firebase.google.com/docs/admin/setup
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
// ----- End Firebase Admin SDK Initialization ----- //

/**
 * Creates an invitation document in Firestore.
 * Requires authentication and checks if the caller is an Administrator.
 *
 * @param {object} data - Data passed to the function.
 * @param {string} data.email - Email of the user to invite.
 * @param {string} data.role - Role to assign ('User' or 'Administrator').
 * @param {functions.https.CallableContext} context - Context of the function call.
 * @returns {Promise<{success: boolean, inviteCode: string | null, message: string}>} Result object.
 */
exports.createInvite = functions.https.onCall(async (data, context) => {
  // 1. Check Authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const callerUid = context.auth.uid;
  const { email, role } = data;

  // 2. Validate Input
  if (!email || !role || (role !== 'User' && role !== 'Administrator')) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Please provide a valid email and role ('User' or 'Administrator')."
    );
  }

  try {
    // 3. Verify Caller is an Administrator
    const callerDoc = await db.collection("users").doc(callerUid).get();
    if (!callerDoc.exists || callerDoc.data().role !== "Administrator") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only administrators can create invites."
      );
    }

    // 4. Generate Unique Invite Code
    const inviteCode = uuidv4();

    // 5. Create Invite Document
    const inviteData = {
      email: email,
      inviteCode: inviteCode,
      status: "pending",
      role: role,
      createdBy: callerUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // Optional: Set expiration (e.g., 7 days)
      // expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    };

    await db.collection("invites").add(inviteData);

    // TODO: Implement email notification to the invited user (optional)

    console.log(`Invite created for ${email} with code ${inviteCode} by ${callerUid}`);
    return { success: true, inviteCode: inviteCode, message: "Invite created successfully." };

  } catch (error) {
    console.error("Error creating invite:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError
    }
    throw new functions.https.HttpsError(
      "internal",
      "An internal error occurred while creating the invite."
    );
  }
});

/**
 * Verifies an invite code and updates the user document upon signup.
 *
 * @param {object} data - Data passed to the function.
 * @param {string} data.inviteCode - The invite code to verify.
 * @param {string} data.newUserUid - The UID of the newly signed-up user.
 * @param {string} data.newUserEmail - The email of the newly signed-up user.
 * @param {functions.https.CallableContext} context - Context of the function call (not used for auth here, relies on data).
 * @returns {Promise<{success: boolean, role: string | null, message: string}>} Result object.
 */
exports.verifyAndAcceptInvite = functions.https.onCall(async (data, context) => {
    const { inviteCode, newUserUid, newUserEmail } = data;

    if (!inviteCode || !newUserUid || !newUserEmail) {
         throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing invite code, user UID, or user email."
         );
    }

    const invitesRef = db.collection("invites");

    try {
        // Find the pending invite with the matching code
        const querySnapshot = await invitesRef
            .where("inviteCode", "==", inviteCode)
            .where("status", "==", "pending")
            // Optional: Add expiration check: .where("expiresAt", ">", admin.firestore.Timestamp.now())
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            throw new functions.https.HttpsError(
                "not-found",
                "Invalid, expired, or already used invite code."
            );
        }

        const inviteDoc = querySnapshot.docs[0];
        const inviteData = inviteDoc.data();

        // Verify email match (case-insensitive)
        if (inviteData.email.toLowerCase() !== newUserEmail.toLowerCase()) {
             throw new functions.https.HttpsError(
                "permission-denied",
                "Invite code is not associated with this email address."
            );
        }

        // Use a Firestore transaction for atomic update
        await db.runTransaction(async (transaction) => {
            const userRef = db.collection("users").doc(newUserUid);

            // Update invite status
            transaction.update(inviteDoc.ref, {
                status: "accepted",
                acceptedByUid: newUserUid,
                acceptedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Update/create the user's document with role and mark as onboarded
            // Using set with merge:true ensures we don't overwrite existing fields if the doc was created by auth trigger
            transaction.set(userRef, {
                email: newUserEmail, // Ensure email is stored consistently
                role: inviteData.role,
                assignedProjects: [], // Initialize empty projects list
                onboarded: true, // Mark user as onboarded
                // Keep createdAt if it exists, otherwise set it
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });

        console.log(`Invite ${inviteCode} accepted by ${newUserEmail} (UID: ${newUserUid}). Role set to ${inviteData.role}.`);
        return { success: true, role: inviteData.role, message: "Invite accepted successfully. User role assigned." };

    } catch (error) {
        console.error("Error verifying/accepting invite:", error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
         }
        throw new functions.https.HttpsError(
            "internal",
            "An internal error occurred while processing the invite."
        );
    }
});
