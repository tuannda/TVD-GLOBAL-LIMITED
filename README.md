## VietSF

Simple Firebase CMS built with Next.js + Firestore. Public pages are SSG-generated from the `pages` collection. Authenticated users can create/edit pages under `/admin`.

## Quick Start for Deployment

### Prerequisites

- Firebase Project (free tier OK)
- Vercel Account (optional, for hosting)
- Git/GitHub

### Step 1: Clone & Install

```bash
git clone <your-repo>
cd vietsf
npm install
```

### Step 2: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Go to **Project Settings** → **Service Accounts** tab
3. Click **"Generate new private key"** (downloads JSON)
4. Copy your **Project ID**

### Step 3: Setup Environment

Copy `.env.local.example` to `.env.local` and fill in credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase credentials from Step 2.

**Keys to fill:**

- `NEXT_PUBLIC_FIREBASE_*` - from Firebase Client SDK settings
- `FIREBASE_PRIVATE_KEY_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_CLIENT_ID`, `FIREBASE_CLIENT_CERT_URL` - from downloaded Service Account JSON
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - create your admin account

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

### Step 4: Run Setup

```bash
npm run setup
```

This will:

- ✅ Create admin account in Firebase
- ✅ Deploy Firestore security rules
- ✅ Initialize your project

### Step 5: Deploy

```bash
git add .
git commit -m "Setup Firebase"
git push
```

If connected to Vercel, it will deploy automatically!

## Local Development

### With Firebase Emulator (recommended)

```bash
npm run emulators  # Terminal 1
npm run dev        # Terminal 2
```

Visit `http://localhost:3000`

### With Live Firebase

```bash
npm run dev
```

Make sure `.env.local` has live Firebase credentials.

## Project Structure

- `/src/app/[slug]/page.tsx` - Public pages (SSG)
- `/src/app/admin/page.tsx` - Admin panel (login + page manager)
- `/src/app/admin/edit/[id]/page.tsx` - Page editor
- `/src/lib/firebase/` - Firebase setup & hooks
- `firestore.rules` - Firestore security rules (auto-deployed)

- `title`: string
- `slug`: string
- `html`: string
- `published`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

Public routes:

- `/` lists published pages.
- `/[slug]` shows a published page.
- `/admin` manages pages.
