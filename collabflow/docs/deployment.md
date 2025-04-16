# CollabFlow Deployment Guide

This document outlines the steps required to deploy the various components of the CollabFlow application.

## Prerequisites

1.  **Firebase CLI:** Install or update the Firebase CLI: `npm install -g firebase-tools`
2.  **Firebase Login:** Log in to your Firebase account: `firebase login`
3.  **Firebase Project:** Ensure you have created a Firebase project and have its Project ID.
4.  **Project Initialization:** If you haven't already, initialize Firebase in your project root: `firebase init`. Select Firestore and Functions. Link it to your Firebase project. This creates `firebase.json` and potentially `.firebaserc`.
5.  **Select Project:** Ensure the correct Firebase project is active: `firebase use <your-firebase-project-id>`

## Deploying Cloud Functions (`/functions`)

Cloud Functions contain the backend logic (e.g., invite management, project CRUD).

1.  **Navigate to Functions Directory:**
    ```bash
    cd functions
    ```

2.  **Install Dependencies:** If you haven't already, or if `package.json` changed:
    ```bash
    npm install
    ```
    *   This installs dependencies listed in `functions/package.json`, including `firebase-admin`, `firebase-functions`, and `uuid`.

3.  **Create `index.js` (if it doesn't exist):**
    Firebase deploys functions exported from `index.js` (by default, configurable in `firebase.json`). Create/update `functions/index.js` to export your functions:
    ```javascript
    // functions/index.js
    const admin = require('firebase-admin');
    
    // Initialize admin SDK only once (if not already done in individual files)
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    
    // Export functions from individual files
    const inviteFunctions = require('./invite');
    const projectFunctions = require('./projects'); // Add this when projects.js is ready
    
    // Invite Functions
    exports.createInvite = inviteFunctions.createInvite;
    exports.verifyAndAcceptInvite = inviteFunctions.verifyAndAcceptInvite;
    
    // Project Functions (Uncomment when implemented)
    exports.createProject = projectFunctions.createProject;
    exports.getProjects = projectFunctions.getProjects;
    exports.updateProject = projectFunctions.updateProject;
    exports.deleteProject = projectFunctions.deleteProject;
    
    // Add other function groups as needed
    ```

4.  **Deploy Functions:**
    From the project **root** directory (where `firebase.json` is located):
    ```bash
    firebase deploy --only functions
    ```
    *   This command deploys all functions exported in `functions/index.js`.
    *   To deploy a specific function (e.g., `createInvite`): `firebase deploy --only functions:createInvite`

## Deploying Firestore Rules (`/firestore.rules`)

Firestore rules control access to your database.

1.  **Navigate to Project Root:** Ensure you are in the root directory of your project where `firestore.rules` and `firebase.json` are located.

2.  **Review `firebase.json`:** Ensure the `firestore.rules` path is correct in `firebase.json`:
    ```json
    {
      "firestore": {
        "rules": "firestore.rules", // Make sure this path is correct
        "indexes": "firestore.indexes.json" // Optional: If you define indexes
      },
      "functions": [
         { 
            "source": "functions",
            "codebase": "default", // Use codebases if managing multiple function groups
            "ignore": [
               "node_modules",
               ".git",
               "firebase-debug.log",
               "firebase-debug.*.log"
             ],
            "predeploy": [
                "npm --prefix "$RESOURCE_DIR" run lint", // Optional: Add linting/build steps
                "npm --prefix "$RESOURCE_DIR" run build" // Optional: If using TypeScript in functions
            ],
            "runtime": "nodejs18" // Or your chosen runtime (e.g., nodejs20)
         }
       ],
       "hosting": {
         // Your hosting config (if using Firebase Hosting for the web app)
       }
      // Other configurations like Storage, Emulators, etc.
    }
    ```

3.  **Deploy Rules:**
    From the project **root** directory:
    ```bash
    firebase deploy --only firestore:rules
    ```

## Deploying Firestore Indexes (`/firestore.indexes.json`)

If your queries require specific composite indexes (often identified by Firestore console warnings or errors), define them in `firestore.indexes.json`.

1.  **Create/Update `firestore.indexes.json`:** Add necessary index definitions.
2.  **Deploy Indexes:**
    From the project **root** directory:
    ```bash
    firebase deploy --only firestore:indexes
    ```

## Deploying Next.js Frontend (Example: Vercel)

1.  **Connect Repository:** Connect your Git repository (GitHub, GitLab, Bitbucket) to Vercel.
2.  **Configure Project:** Vercel typically auto-detects Next.js projects.
3.  **Environment Variables:**
    *   Navigate to your Vercel project settings > Environment Variables.
    *   Add your Firebase client-side configuration variables (prefixed with `NEXT_PUBLIC_`):
        *   `NEXT_PUBLIC_FIREBASE_API_KEY`
        *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
        *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
        *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
        *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
        *   `NEXT_PUBLIC_FIREBASE_APP_ID`
        *   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (Optional)
4.  **Build Command & Output Directory:** Ensure Vercel settings correctly identify the build command (`npm run build` or `next build`) and the output directory (`.next`).
5.  **Deploy:** Push changes to your main branch (or the branch configured for deployment) or use Vercel's deploy hooks/CLI.

*(Adjust deployment steps based on your chosen hosting provider for the Next.js app, e.g., Firebase Hosting, Netlify, AWS Amplify.)*
