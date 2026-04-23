# Firebase Setup Guide for Deployment

## Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Go to **Project Settings** → **Service Accounts**
4. Click "Generate new private key" (this downloads a JSON file)
5. Also copy your Firebase **Project ID**

Keep the downloaded JSON safe!

## Step 2: Fill .env.local

Copy the credentials into `.env.local`:

```env
# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# Firebase Admin (private - from downloaded JSON)
FIREBASE_PRIVATE_KEY_ID=YOUR_PRIVATE_KEY_ID
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=YOUR_CLIENT_EMAIL
FIREBASE_CLIENT_ID=YOUR_CLIENT_ID
FIREBASE_CLIENT_CERT_URL=YOUR_CERT_URL

# Admin Account (create this account automatically)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword123
```

**Note:** Keep `FIREBASE_PRIVATE_KEY` as one line with `\n` for newlines.

## Step 3: Run Setup Script

```bash
npm install
npm run setup
```

This will:

- ✅ Create admin account
- ✅ Deploy Firestore rules
- ✅ Set up project

## Step 4: Deploy to Vercel

```bash
git add .
git commit -m "Setup Firebase"
git push
```

Vercel will automatically deploy!

## Troubleshooting

### Error: firebase-admin not installed

```bash
npm install --save-dev firebase-admin
```

### Error: Firebase CLI not found

```bash
npm install -g firebase-tools
firebase login
```

### Error: Invalid private key

Make sure `FIREBASE_PRIVATE_KEY` includes `\n` for newlines:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nLINE1\nLINE2\n-----END PRIVATE KEY-----\n"
```

### Firestore rules deployment fails

It's OK! You can deploy manually later:

```bash
firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
```
