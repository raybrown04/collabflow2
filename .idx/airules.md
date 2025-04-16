# AI Rules for CollabFlow Project in Firebase Studio

## Project Overview
- CollabFlow is a collaborative workspace application built with Firebase, integrating project management, calendar, tasks, document management, email, and AI assistance for administrators.
- The project follows the blueprint defined in `@blueprint.md`, located in the project root. Always refer to `@blueprint.md` for context, requirements, and specifications throughout the buildout to ensure alignment with the project vision.

## Build Structure and File Organization
- Maintain the existing project structure as follows:
  - `/src`: Contains all source code for the frontend (React/Next.js for web, React Native/Flutter for mobile).
  - `/src/components`: Reusable UI components (e.g., `Dashboard.jsx`, `TaskCard.jsx`).
  - `/src/pages`: Page components for Next.js or main screens for React Native (e.g., `Dashboard.js`, `ProjectView.js`).
  - `/src/lib`: Utility functions and Firebase SDK integrations (e.g., `firebaseConfig.js`, `auth.js`).
  - `/src/styles`: CSS/SCSS files or styled-components for styling, adhering to the style guidelines in `@blueprint.md`.
  - `/functions`: Firebase Cloud Functions for backend logic (e.g., `calendar.js`, `dropbox.js`).
  - `/docs`: Documentation files, including `@status.md` for project status tracking.
- Place new components in `/src/components` using kebab-case (e.g., `task-card.jsx`).
- Place new pages/screens in `/src/pages` (web) or `/src/screens` (mobile) using kebab-case (e.g., `project-view.js`).
- Do not modify files in `/dist`, `/build`, or `/node_modules` unless explicitly instructed.
- Use relative paths for imports based on the `/src` directory (e.g., `import { TaskCard } from '../components/task-card'`).

## Codebase Indexing
- Index the entire codebase except files/folders specified in `.aiexclude` (e.g., `/node_modules`, `/dist`, `.env`).
- Prioritize indexing `@blueprint.md` and `@docs/status.md` to maintain context and track project state.
- When generating or modifying code, reference indexed files using `@` (e.g., `@src/components/Dashboard.jsx`) to ensure context-aware suggestions.

## Persistent Context
- Reference `@blueprint.md` in every interaction to maintain alignment with the project’s core features, style guidelines, and technology stack.
- Use `@docs/status.md` to understand the current state of the project. This file contains:
  - **Global Project Status**: Overall progress (e.g., percentage complete, major milestones).
  - **Completed**: List of finished features or tasks.
  - **In Progress**: List of ongoing tasks or features.
  - **Next Steps**: Planned tasks or features to tackle next.
- Update `@docs/status.md` with relevant changes when generating code or completing tasks to reflect the latest project state.
- Use chat threads to maintain context across sessions. Create separate threads for major features (e.g., “Dashboard”, “Calendar Integration”, “AI Assistance”).

## Coding Guidelines
- Follow the style guidelines in `@blueprint.md`:
  - Use primary color `#003366` (Dark Blue), secondary color `#EEEEEE` (Light Grey), and accent color `#DDDDDD` (Light Grey).
  - Use sans-serif fonts (Roboto or Open Sans) for readability.
  - Use simple, line-based, monochromatic icons in shades of grey or primary blue.
  - Ensure a clean layout with clear visual hierarchy and effective use of whitespace.
  - Apply subtle animations for user feedback (e.g., button hover, page transitions).
- Write code in TypeScript for both web (React/Next.js) and mobile (React Native/Flutter) to ensure type safety.
- Prefer functional components over class-based components for React/Next.js.
- Follow Firebase best practices for Firestore schema, security rules, and Cloud Functions as outlined in `@blueprint.md`.
- Ensure role-based access control:
  - Only users with the `Administrator` role can access AI features (e.g., AI Quick Search, AI Project Assistant).
  - Restrict `User` role to data associated with assigned projects.

## Feature Implementation
- Implement features as described in `@blueprint.md`:
  - **Unified Workspace Dashboard**: Central hub with widgets for projects, tasks, calendar events, and recent documents/emails.
  - **Calendar Management**: Integrate with Google Calendar, Microsoft Outlook, and Apple Calendar using Cloud Functions.
  - **Task Tracking**: Support task creation, assignment, due dates, priorities, and project linking.
  - **Document Management**: Integrate with Dropbox for file browsing, uploading, and real-time sync.
  - **Email Integration**: Support Gmail, Outlook, and Apple Mail with project-specific tagging.
  - **AI Assistance**: Use Gemini API for Administrator-only features (AI Quick Search, AI Project Assistant).
  - **User Management**: Implement Firebase Authentication with Google, Microsoft, and Apple sign-in, and an invite-only system.
- Use Firebase Cloud Functions for external API integrations (e.g., Google Calendar API, Dropbox API, Microsoft Graph API).
- Store metadata in Firestore for tasks, documents, emails, and calendar events, ensuring project-based segregation.

## Status Tracking
- Maintain `@docs/status.md` to track project progress. When generating code or completing tasks, propose updates to `@docs/status.md` with:
  - Changes to global project status (e.g., new milestone reached).
  - Newly completed features or tasks.
  - Updates to in-progress tasks.
  - Suggested next steps based on `@blueprint.md`.
- Before generating code, review `@docs/status.md` to understand the current state and avoid duplicating completed work.

## Prompt Best Practices
- Respond to prompts with concise, actionable code or suggestions aligned with `@blueprint.md`.
- Use slash commands (e.g., `/generate component in /src/components`) for precise file placement.
- Validate generated code for syntax errors and adherence to style guidelines before suggesting application.
- If unsure about context, ask for clarification while referencing `@blueprint.md` or `@docs/status.md`.

## Example Prompt Handling
- For a prompt like “Generate a task component”:
  - Place the component in `/src/components/task-card.jsx`.
  - Use TypeScript and functional component syntax.
  - Apply styles from `@blueprint.md` (e.g., Dark Blue buttons, Roboto font).
  - Reference `@docs/status.md` to check if task-related features are in progress or completed.
  - Propose an update to `@docs/status.md` to reflect the new component.