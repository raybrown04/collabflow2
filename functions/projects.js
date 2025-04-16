const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Admin SDK if not already done (e.g., in index.js)
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// Helper function to check if a user is an Administrator
const isAdministrator = async (uid) => {
  if (!uid) return false;
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    return userDoc.exists && userDoc.data().role === "Administrator";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Creates a new project document in Firestore.
 * Only Administrators can create projects.
 *
 * @param {object} data - Data passed to the function.
 * @param {string} data.name - Name of the project.
 * @param {string} [data.description] - Optional description.
 * @param {string[]} data.members - Array of member UIDs (must include the creator).
 * @param {functions.https.CallableContext} context - Context of the function call.
 * @returns {Promise<{success: boolean, projectId: string | null, message: string}>} Result object.
 */
exports.createProject = functions.https.onCall(async (data, context) => {
  // 1. Check Authentication and Admin Role
  if (!context.auth || !(await isAdministrator(context.auth.uid))) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only administrators can create projects."
    );
  }

  const callerUid = context.auth.uid;
  const { name, description = "", members } = data;

  // 2. Validate Input
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new functions.https.HttpsError("invalid-argument", "Project name is required.");
  }
  if (!Array.isArray(members) || members.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "Project must have at least one member.");
  }
  if (!members.includes(callerUid)) {
    throw new functions.https.HttpsError("invalid-argument", "Project creator must be included in the members list.");
  }

  try {
    // 3. Create Project Document
    const projectRef = db.collection("projects").doc(); // Auto-generate ID
    const projectId = projectRef.id;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const projectData = {
      projectId: projectId, // Store the ID within the document too
      name: name.trim(),
      description: description.trim(),
      members: [...new Set(members)], // Ensure unique member UIDs
      createdBy: callerUid,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await projectRef.set(projectData);

    // 4. TODO: Update `assignedProjects` in each member's user document (optional but good for client-side filtering)
    // This might be better handled by a separate Firestore trigger on project create/update.
    // Example (needs error handling and batching for many members):
    /*
    const batch = db.batch();
    members.forEach(uid => {
      const userRef = db.collection('users').doc(uid);
      batch.update(userRef, {
        assignedProjects: admin.firestore.FieldValue.arrayUnion(projectId)
      });
    });
    await batch.commit();
    */

    console.log(`Project created: ${projectId} by ${callerUid}`);
    return { success: true, projectId: projectId, message: "Project created successfully." };

  } catch (error) {
    console.error("Error creating project:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "An internal error occurred while creating the project.");
  }
});

/**
 * Retrieves projects accessible to the calling user.
 * Admins get all projects. Users get projects they are members of.
 *
 * @param {object} data - Data passed to the function (can be empty).
 * @param {functions.https.CallableContext} context - Context of the function call.
 * @returns {Promise<{success: boolean, projects: object[], message: string}>} Result object with projects array.
 */
exports.getProjects = functions.https.onCall(async (data, context) => {
  // 1. Check Authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  const uid = context.auth.uid;
  const userIsAdmin = await isAdministrator(uid);

  try {
    let query = db.collection("projects");

    // 2. Build Query based on Role
    if (!userIsAdmin) {
      // Regular users only see projects where their UID is in the `members` array
      query = query.where("members", "array-contains", uid);
    }

    // Add ordering if desired, e.g., by name or creation date
    query = query.orderBy("createdAt", "desc");

    // 3. Execute Query
    const snapshot = await query.get();
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Timestamps to ISO strings or millis if needed for client
      createdAt: doc.data().createdAt.toDate().toISOString(),
      updatedAt: doc.data().updatedAt.toDate().toISOString(),
    }));

    return { success: true, projects: projects, message: "Projects retrieved successfully." };

  } catch (error) {
    console.error("Error getting projects:", error);
    throw new functions.https.HttpsError("internal", "An internal error occurred while retrieving projects.");
  }
});

/**
 * Updates an existing project document.
 * Only Administrators can update projects.
 *
 * @param {object} data - Data passed to the function.
 * @param {string} data.projectId - ID of the project to update.
 * @param {object} data.updates - Fields to update (e.g., { name, description, members }).
 * @param {functions.https.CallableContext} context - Context of the function call.
 * @returns {Promise<{success: boolean, message: string}>} Result object.
 */
exports.updateProject = functions.https.onCall(async (data, context) => {
  // 1. Check Authentication and Admin Role
  if (!context.auth || !(await isAdministrator(context.auth.uid))) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only administrators can update projects."
    );
  }

  const { projectId, updates } = data;

  // 2. Validate Input
  if (!projectId || typeof projectId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Project ID is required.");
  }
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "Updates object is required.");
  }

  // Prevent updating immutable fields
  delete updates.projectId; // Cannot change the ID
  delete updates.createdBy;
  delete updates.createdAt;

  // Validate specific fields if present
  if (updates.name !== undefined && (typeof updates.name !== 'string' || updates.name.trim() === '')) {
      throw new functions.https.HttpsError("invalid-argument", "Project name cannot be empty.");
  }
  if (updates.members !== undefined && (!Array.isArray(updates.members) || updates.members.length === 0)) {
      throw new functions.https.HttpsError("invalid-argument", "Members list cannot be empty.");
  }

  try {
    const projectRef = db.collection("projects").doc(projectId);
    const doc = await projectRef.get();

    if (!doc.exists) {
      throw new functions.https.HttpsError("not-found", "Project not found.");
    }

    // Add updatedAt timestamp
    const updateData = {
        ...updates,
        // Ensure members are unique if updated
        ...(updates.members && { members: [...new Set(updates.members)] }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await projectRef.update(updateData);

    // 4. TODO: Handle synchronization of `assignedProjects` in user documents if members changed.
    // This is complex and likely requires comparing old/new member lists and using triggers.

    console.log(`Project updated: ${projectId} by ${context.auth.uid}`);
    return { success: true, message: "Project updated successfully." };

  } catch (error) {
    console.error("Error updating project:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "An internal error occurred while updating the project.");
  }
});

/**
 * Deletes a project document.
 * Only Administrators can delete projects.
 *
 * @param {object} data - Data passed to the function.
 * @param {string} data.projectId - ID of the project to delete.
 * @param {functions.https.CallableContext} context - Context of the function call.
 * @returns {Promise<{success: boolean, message: string}>} Result object.
 */
exports.deleteProject = functions.https.onCall(async (data, context) => {
  // 1. Check Authentication and Admin Role
  if (!context.auth || !(await isAdministrator(context.auth.uid))) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only administrators can delete projects."
    );
  }

  const { projectId } = data;

  // 2. Validate Input
  if (!projectId || typeof projectId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Project ID is required.");
  }

  try {
    const projectRef = db.collection("projects").doc(projectId);
    const doc = await projectRef.get();

    if (!doc.exists) {
      throw new functions.https.HttpsError("not-found", "Project not found.");
    }

    // Get members before deleting to update their assignedProjects
    const members = doc.data().members || [];

    await projectRef.delete();

    // 3. TODO: Remove projectId from `assignedProjects` in each member's user document.
    // Also consider deleting sub-collections (tasks, etc.) associated with the project.
    // This requires careful handling, possibly another background function or trigger.
    /*
    const batch = db.batch();
    members.forEach(uid => {
      const userRef = db.collection('users').doc(uid);
      batch.update(userRef, {
        assignedProjects: admin.firestore.FieldValue.arrayRemove(projectId)
      });
    });
    await batch.commit();
    */

    console.log(`Project deleted: ${projectId} by ${context.auth.uid}`);
    return { success: true, message: "Project deleted successfully." };

  } catch (error) {
    console.error("Error deleting project:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "An internal error occurred while deleting the project.");
  }
});
