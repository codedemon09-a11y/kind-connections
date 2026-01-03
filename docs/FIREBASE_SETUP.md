# Firebase Setup Guide for BattleArena

This guide provides step-by-step instructions to set up Firebase for the BattleArena tournament platform.

## Table of Contents

1. [Create Firebase Project](#1-create-firebase-project)
2. [Enable Authentication](#2-enable-authentication)
3. [Set Up Firestore Database](#3-set-up-firestore-database)
4. [Configure Firestore Security Rules](#4-configure-firestore-security-rules)
5. [Get Firebase Configuration](#5-get-firebase-configuration)
6. [Update Application Code](#6-update-application-code)
7. [Database Structure](#7-database-structure)
8. [Testing the Setup](#8-testing-the-setup)

---

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"** or **"Create a project"**
3. Enter project name: `battlearena` (or your preferred name)
4. Enable/Disable Google Analytics (optional)
5. Click **"Create Project"**
6. Wait for project creation to complete
7. Click **"Continue"**

---

## 2. Enable Authentication

1. In Firebase Console, select your project
2. Click **"Build"** in the left sidebar
3. Click **"Authentication"**
4. Click **"Get Started"**
5. Go to **"Sign-in method"** tab
6. Enable **"Email/Password"** provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click **"Save"**

### Optional: Enable Password Reset

Email/Password authentication already supports password reset. Users can reset passwords via email automatically.

---

## 3. Set Up Firestore Database

1. In Firebase Console, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose a location closest to your users (e.g., `asia-south1` for India)
4. Select **"Start in test mode"** (we'll add proper rules later)
5. Click **"Enable"**

### Create Required Collections

After Firestore is enabled, create the following collection:

#### Users Collection

1. Click **"Start collection"**
2. Collection ID: `users`
3. Click **"Auto-ID"** for the first document (we'll delete this later)
4. Add these fields for the sample document:

| Field Name | Type | Sample Value |
|------------|------|--------------|
| email | string | test@example.com |
| displayName | string | Test User |
| phone | string | 9999999999 |
| walletBalance | number | 0 |
| winningCredits | number | 0 |
| isBanned | boolean | false |
| isAdmin | boolean | false |
| createdAt | timestamp | (current time) |
| updatedAt | timestamp | (current time) |

5. Click **"Save"**
6. You can delete this test document after verifying the structure

---

## 4. Configure Firestore Security Rules

1. In Firestore, click **"Rules"** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Users collection rules
    match /users/{userId} {
      // Anyone authenticated can read user profiles
      allow read: if request.auth != null;

      // Users can only update their own profile
      allow update: if request.auth != null && request.auth.uid == userId;

      // Only authenticated users can create their own profile
      allow create: if request.auth != null && request.auth.uid == userId;

      // Only admins can delete users
      allow delete: if isAdmin();
    }

    // Withdrawals collection
    match /withdrawals/{withdrawalId} {
      // Users can create their own withdrawal request with PENDING status
      allow create: if request.auth != null &&
        request.resource.data.oderId == request.auth.uid &&
        request.resource.data.status == 'PENDING';

      // Admins can read all withdrawals; users can read their own
      allow read: if request.auth != null && 
        (isAdmin() || resource.data.oderId == request.auth.uid);

      // Only admins can update or delete withdrawals
      allow update, delete: if isAdmin();
    }

    // Transactions collection (optional)
    match /transactions/{transactionId} {
      allow read: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow write: if false; // Only backend should write
    }

    // Tournaments collection (optional)
    match /tournaments/{tournamentId} {
      allow read: if true; // Public read
      allow write: if isAdmin();
    }
  }
}
```

3. Click **"Publish"**

### Important Security Notes

- **isAdmin field**: To make a user an admin, manually set `isAdmin: true` in their Firestore document
- **Never expose admin privileges** through client-side code
- **Test your rules** using the Rules Playground in Firebase Console

---

## 5. Get Firebase Configuration

1. In Firebase Console, click the **gear icon** → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click **"Web"** icon (</>) to add a web app
4. Enter app nickname: `battlearena-web`
5. Click **"Register app"**
6. Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 6. Update Application Code

### Step 1: Open Firebase Configuration File

Open the file: `src/lib/firebase.ts`

### Step 2: Replace Configuration

Replace the existing configuration with your Firebase config:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with YOUR Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                              // Replace this
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",       // Replace this
  projectId: "YOUR_PROJECT_ID",                        // Replace this
  storageBucket: "YOUR_PROJECT_ID.appspot.com",        // Replace this
  messagingSenderId: "YOUR_SENDER_ID",                 // Replace this
  appId: "YOUR_APP_ID"                                 // Replace this
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```

### Step 3: Save the File

Save `src/lib/firebase.ts` after making changes.

---

## 7. Database Structure

### Users Collection (`/users/{userId}`)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Firebase UID (same as document ID) |
| email | string | User's email address |
| displayName | string | User's display name |
| phone | string | User's phone number |
| walletBalance | number | Deposit balance (INR) |
| winningCredits | number | Prize money balance (INR) |
| isBanned | boolean | Whether user is banned |
| isAdmin | boolean | Whether user is admin |
| createdAt | timestamp | Account creation date |
| updatedAt | timestamp | Last update date |

### Creating an Admin User

1. Let a user sign up normally through the app
2. Go to Firebase Console → Firestore
3. Find the user in the `users` collection
4. Edit the document
5. Change `isAdmin` from `false` to `true`
6. Save the document
7. The user is now an admin and can access `/admin` routes

---

## 8. Testing the Setup

### Test Authentication

1. Open your application
2. Go to the Login page
3. Click "Sign Up"
4. Create a new account with email and password
5. Verify the user appears in Firebase Console → Authentication → Users
6. Verify a document is created in Firestore → users collection

### Test Database Operations

1. Log in as a regular user
2. Check that the wallet page loads correctly
3. Check that the profile page shows user data

### Test Admin Access

1. Make yourself an admin (see "Creating an Admin User" above)
2. Log out and log back in
3. Navigate to `/admin`
4. Verify you can see the admin dashboard

---

## Troubleshooting

### "Permission Denied" Errors

- Check Firestore Security Rules are published
- Verify the user is authenticated
- Check if the operation matches the rules

### Users Not Appearing in Admin Panel

- Verify Firestore rules allow authenticated users to read `/users`
- Check browser console for errors
- Ensure the user document was created during signup

### "Module not found" Error

Run the following to install Firebase:

```bash
npm install firebase
```

### Authentication Errors

- Ensure Email/Password provider is enabled
- Check that the Firebase config is correct
- Verify the API key hasn't been restricted incorrectly

---

## Production Checklist

Before going to production:

- [ ] Update Firestore rules to production security
- [ ] Enable App Check for additional security
- [ ] Set up Firebase Authentication quotas
- [ ] Enable Firebase Analytics (optional)
- [ ] Set up Firebase Cloud Functions for sensitive operations
- [ ] Review and restrict API key permissions
- [ ] Enable Firestore backups
- [ ] Set up monitoring and alerts

---

## Support

For Firebase-related issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow - Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)
