# **App Name**: CollabFlow

## Core Features:

- Unified Workspace Dashboard: A central dashboard displaying projects, tasks, calendar events, and recent documents/emails. The dashboard is the central place to start the collaboration.
- Calendar Management: Integrates with Google Calendar, Microsoft Outlook Calendar, and Apple Calendar to provide a unified view of all events. It allows creating/editing events directly within the app, syncing back to the source calendar. Cloud Functions are used to handle backend API interactions.
- Task Tracking: Allows creating, viewing, updating, and deleting tasks. Tasks can be assigned to users, and can have due dates, priorities, and statuses. Tasks can be linked to specific projects.
- Document Management: Integrates with Dropbox to allow users to browse, upload, download, preview, and organize files/folders within their linked Dropbox account, directly associated with specific projects in CollabFlow. Real-time synchronization ensures that changes made within CollabFlow are reflected in the user's Dropbox, and vice-versa.
- AI Assistance for Admins: Provides AI-powered features using the Google Gemini API, including AI Quick Search and an AI Project Assistant. These features are only available to users with the 'Administrator' role. The AI Project Assistant will use tool calls to use information about your tasks, emails and documents.

## Style Guidelines:

- Primary color: Dark Blue (#003366) for a professional and reliable feel.
- Secondary color: Light Grey (#EEEEEE) for backgrounds and neutral elements, providing a clean and modern look.
- Accent: Light Grey (#DDDDDD) for CTAs and highlights, offering a subtle contrast.
- Clean and modern sans-serif fonts (e.g., Roboto, Open Sans) for optimal readability and a professional appearance.
- Simple, line-based icons in a monochromatic style (using shades of grey or the primary blue) for a clean and minimalist aesthetic.
- A well-structured and intuitive layout with a focus on clear visual hierarchy, utilizing whitespace effectively to avoid clutter.
- Subtle and purposeful animations and transitions to enhance the user experience without being distracting. Use animations to guide the user and provide feedback on actions.

## Original User Request:
**Objective:** Generate the foundational structure and key components for a new collaborative workspace application named "CollabFlow" using Firebase. This app should serve as a unified workspace integrating project management, calendar, tasks, documents, email, and AI assistance.

**Target Platforms:**
*   Web Application (using React/Next.js or suggest a suitable modern framework compatible with Firebase)
*   Mobile Application (iOS and Android, using React Native/Flutter or suggest a cross-platform framework)
*   Both platforms should share the same Firebase backend.

**Core Functionality & Components:**

1.  **Unified Workspace:** The app should provide a central hub for users to manage their work across different tools.
2.  **Project Component:**
    *   **Dashboard:** Central landing page displaying an overview of all accessible projects. Include widgets for upcoming calendar events, pending tasks, and recent documents/emails related to projects.
    *   **Project-Specific Views:** Allow users to drill down into individual projects, showing only the calendar, tasks, documents, and emails associated with that specific project.
    *   **Filtering/Sorting:** Implement basic filtering and sorting options for projects, tasks, and documents within the dashboard and project views.
3.  **Calendar Management:**
    *   Integrate with user's existing calendars: Google Calendar, Microsoft Outlook Calendar, and Apple Calendar.
    *   Display a unified calendar view within the app, aggregating events from connected accounts.
    *   Allow creating/editing events directly within the app, syncing back to the source calendar.
    *   Implement project-specific calendar views/filters.
    *   Utilize Firebase Cloud Functions to handle backend API interactions (Google Calendar API, Microsoft Graph API). Advise on the best approach for Apple Calendar integration.
4.  **Task Tracking:**
    *   Create, view, update, and delete tasks.
    *   Assign tasks to users (within the context of a project).
    *   Set due dates, priorities, and statuses for tasks.
    *   Link tasks directly to specific projects.
5.  **Document Management:**
    *   **Dropbox Integration:**
        *   Authenticate user's Dropbox account.
        *   Allow users to browse, upload, download, preview, and organize files/folders within their linked Dropbox account, directly associated with specific projects in CollabFlow.
        *   Implement real-time synchronization: Changes made within CollabFlow (e.g., uploading a file to a project folder) should reflect in the user's Dropbox, and vice-versa (if feasible via Dropbox API webhooks or periodic checks).
    *   Use Firebase Cloud Functions to manage Dropbox API interactions securely.
    *   Store metadata about linked documents (project association, etc.) in Firestore.
6.  **Email Integration:**
    *   **Unified Client:** Integrate with user's email accounts: Gmail, Microsoft Outlook, and Apple Mail.
    *   Display emails within the CollabFlow interface.
    *   Allow users to tag emails or associate email threads with specific projects.
    *   Utilize Firebase Cloud Functions for backend API interactions (Gmail API, Microsoft Graph API). Advise on the approach for Apple Mail (e.g., generic IMAP/SMTP integration).
7.  **AI Assistance (Administrator Role Only):**
    *   Integrate the Google Gemini API (using the Firebase Studio template/integration[6]).
    *   Implement AI features based on the attached `AI.md` document[1], including:
        *   AI Quick Search (potentially using Perplexity API as specified in `AI.md`, if feasible alongside Gemini).
        *   AI Project Assistant (context-aware, accessing user's project data - calendar, tasks, docs, email).
        *   Plan for specialized assistants (Research, Legal, Finance) as future enhancements[1].
    *   Ensure AI features *only* appear and are usable for users with the 'Administrator' role.
    *   **Google Agent to Agent (A2A):** Provide guidance and initial code structure on how to leverage Google's A2A capabilities or multi-agent interactions using Gemini/Google Cloud AI Platform within Firebase Cloud Functions to enable more complex AI-driven workflows for administrators (e.g., automated reporting based on project data, cross-referencing documents for insights).
8.  **User Management & Permissions:**
    *   **Authentication:** Set up Firebase Authentication supporting Google, Microsoft, and Apple sign-in methods.
    *   **Invite-Only:** The application is private. Implement an invitation system (e.g., Admins can send email invites, new users sign up via invite link). Do not implement public sign-up.
    *   **Roles:** Define two user roles: `Administrator` and `User`.
    *   **Permissions:**
        *   Administrators: Full access to all projects, user management (inviting, assigning roles, assigning users to projects), access to all AI features.
        *   Users: Can only view and interact with data (calendar, tasks, documents, emails) related to projects they are explicitly assigned to by an Administrator. Cannot access AI features or user management sections.
    *   Implement this role-based access control using Firestore Security Rules and checks within Cloud Functions.

**Technology Stack & Implementation Details:**

*   **Backend:** Firebase (Authentication, Firestore, Cloud Functions, potentially Cloud Storage for intermediate files if needed).
*   **Database:** Use Firestore. Propose a schema for `users` (including role, assigned projects), `tasks`, `calendarEvents` (or metadata), `documentMetadata`, `emailMetadata`, `invites`. Ensure the schema supports project-based data segregation.
*   **Frontend:** Generate starter code for the chosen web and mobile frameworks. Set up basic routing and UI shells for the main components (Dashboard, Project View, Calendar, Tasks, Documents, Email Client, Settings/Admin Panel).
*   **Integrations:**
    *   Set up Firebase Cloud Functions stubs for handling API calls to Google Calendar, Microsoft Graph (Calendar/Email), Dropbox, Gmail, and potentially Perplexity/other LLMs. Include necessary authentication flows (OAuth 2.0).
    *   Integrate the Gemini API for the AI features.

**Instructions for Gemini:**

1.  Initialize a Firebase project configuration suitable for this application.
2.  Set up Firebase Authentication with Google, Microsoft, and Apple providers.
3.  Define and generate the Firestore database schema based on the requirements.
4.  Implement Firestore Security Rules to enforce the specified user roles and project-based access control.
5.  Generate boilerplate code for Firebase Cloud Functions to handle external API integrations (provide function signatures and comments on necessary logic for Auth, Google APIs, Microsoft Graph, Dropbox API).
6.  Generate the basic frontend structure (Web and Mobile) with navigation and placeholder pages/components for each major feature.
7.  Integrate the Gemini API into the Cloud Functions environment for administrator-specific AI features.
8.  Provide example code snippets for core actions like:
    *   Fetching projects for the dashboard based on user role.
    *   Fetching tasks/documents/calendar events filtered by a specific project.
    *   Initiating OAuth flows for connecting external accounts (Google, Microsoft, Dropbox).
    *   Making a basic authenticated API call via a Cloud Function (e.g., list Google Calendar events).
    *   Checking user roles to conditionally display UI elements (like AI features or Admin panels).
9.  Advise on best practices for managing API keys and secrets securely within the Firebase environment (e.g., using Cloud Secret Manager).
10. Provide guidance on implementing the A2A/multi-agent concepts using available Google Cloud/Gemini tools within the Firebase backend.

Please generate the initial project structure, configuration files, basic UI layouts, Firestore schema, security rules, and Cloud Function stubs based on these requirements.

  