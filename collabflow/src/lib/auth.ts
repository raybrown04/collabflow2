import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace placeholders with actual Firebase configuration from your project settings
// Ensure these environment variables are set in your Vercel/deployment environment
// For local development, use a .env.local file

// Firebase configuration for Web (Next.js)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Make sure this is prefixed with NEXT_PUBLIC_ for browser access
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional, but recommended
};

// Initialize Firebase only once across client/server
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

// --- Notes for Cross-Platform Compatibility ---

// 1. Environment Variables:
//    - Web (Next.js): Use `NEXT_PUBLIC_` prefix for browser exposure. Set in `.env.local` or deployment environment.
//    - Mobile (React Native): Use libraries like `react-native-config`. Variables won't have `NEXT_PUBLIC_` prefix.
//    - Mobile (Flutter): Use `flutter_dotenv`. Variables won't have `NEXT_PUBLIC_` prefix.
//    - **Action:** You'll need separate environment variable setup for each platform.

// 2. Firebase SDK Initialization:
//    - Web (Next.js): `firebase/app`, `firebase/auth`, `firebase/firestore` (as used above).
//    - React Native: Use `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`. Requires native setup.
//    - Flutter: Use `firebase_core`, `firebase_auth`, `cloud_firestore` packages. Requires native setup.
//    - **Action:** Conditionally import and initialize the correct SDK based on the platform or create separate config files.

// 3. Server-Side Operations (like Cloud Functions):
//    - Use the Firebase Admin SDK (`firebase-admin`) for privileged operations.
//    - See `/functions/invite.js` and `/functions/projects.js` for Admin SDK setup.
