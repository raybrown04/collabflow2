# CollabFlow Firestore Schema

This document outlines the Firestore database schema for the CollabFlow application.

## Collections

### `users`

Stores information about registered users.

- **Document ID**: `uid` (Firebase Authentication User ID)
- **Fields**:
    - `email`: (String) User's email address.
    - `displayName`: (String, optional) User's display name. Can be set during onboarding or profile update.
    - `photoURL`: (String, optional) URL to the user's profile picture.
    - `role`: (String) User's role (`Administrator` or `User`). Assigned during invite acceptance.
    - `assignedProjects`: (Array<String>) List of `projectId`s the user is a member of. Used by rules for `User` access checks.
    - `createdAt`: (Timestamp) Timestamp when the user document was first created (usually upon invite acceptance).
    - `onboarded`: (Boolean) Flag indicating if the user completed the initial onboarding flow.

### `invites`

Stores information about user invitations.

- **Document ID**: Auto-generated Firestore ID.
- **Fields**:
    - `email`: (String) Email address of the invited user.
    - `inviteCode`: (String) Unique code associated with the invitation.
    - `status`: (String) Status of the invite (`pending`, `accepted`, `expired`).
    - `role`: (String) Role assigned to the user upon accepting the invite (`Administrator` or `User`).
    - `createdBy`: (String) `uid` of the Administrator who created the invite.
    - `createdAt`: (Timestamp) Timestamp when the invite was created.
    - `expiresAt`: (Timestamp, optional) Timestamp when the invite code expires.
    - `acceptedByUid`: (String, optional) `uid` of the user who accepted the invite.
    - `acceptedAt`: (Timestamp, optional) Timestamp when the invite was accepted.

### `projects`

Stores information about projects.

- **Document ID**: Auto-generated Firestore ID (referred to as `projectId` within this doc).
- **Fields**:
    - `projectId`: (String) The unique Document ID of this project (useful for querying, often same as Document ID).
    - `name`: (String) Name of the project.
    - `description`: (String, optional) Description of the project.
    - `members`: (Array<String>) List of `uid`s of users assigned to this project (includes Administrators and Users).
    - `createdBy`: (String) `uid` of the Administrator who created the project.
    - `createdAt`: (Timestamp) Timestamp when the project was created.
    - `updatedAt`: (Timestamp) Timestamp when the project was last updated (updated automatically on writes by rules or functions).

**Integration Notes:**

*   When a project is created/updated, the `members` array in the `projects` document should be the source of truth for membership.
*   For efficient querying by `User` roles, the `assignedProjects` array in the `users` document should be updated (likely via a Cloud Function trigger on project writes) to reflect the `projects` the user is a member of.

### `tasks` (Placeholder - To be defined later)

Stores task information, linked to a project.

- **Document ID**: Auto-generated Firestore ID.
- **Fields**:
    - `projectId`: (String) ID of the project this task belongs to.
    - `title`: (String) Task title.
    - `description`: (String, optional) Task description.
    - `status`: (String) e.g., `todo`, `in-progress`, `done`.
    - `priority`: (String) e.g., `low`, `medium`, `high`.
    - `dueDate`: (Timestamp, optional) Task due date.
    - `assignee`: (String, optional) `uid` of the assigned user.
    - `createdAt`: (Timestamp) Timestamp when the task was created.
    - `createdBy`: (String) `uid` of the user who created the task.

### `documentMetadata` (Placeholder - To be defined later)

Stores metadata about documents linked from Dropbox, associated with a project.

- **Document ID**: Auto-generated Firestore ID.
- **Fields**:
    - `projectId`: (String) ID of the project this document is associated with.
    - `fileName`: (String) Name of the file in Dropbox.
    - `dropboxFileId`: (String) Dropbox file ID.
    - `linkedBy`: (String) `uid` of the user who linked the document.
    - `linkedAt`: (Timestamp) Timestamp when the document was linked.

### `emailMetadata` (Placeholder - To be defined later)

Stores metadata about emails linked to projects.

- **Document ID**: Auto-generated Firestore ID.
- **Fields**:
    - `projectId`: (String) ID of the project this email thread is associated with.
    - `emailThreadId`: (String) ID of the email thread (e.g., Gmail thread ID).
    - `subject`: (String) Subject of the email thread.
    - `linkedBy`: (String) `uid` of the user who linked the email.
    - `linkedAt`: (Timestamp) Timestamp when the email was linked.
