#!/usr/bin/env node

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Load environment variables
const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found. Please create it first.");
  console.error("   cp .env.local.example .env.local");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};

envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) {
    env[key.trim()] = value.trim().replace(/^"(.*)"$/, "$1");
  }
});

// Validate required env vars
const required = [
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "FIREBASE_PRIVATE_KEY_ID",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_CLIENT_ID",
  "FIREBASE_CLIENT_CERT_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
];

const missing = required.filter((key) => !env[key]);
if (missing.length > 0) {
  console.error("❌ Missing environment variables in .env.local:");
  missing.forEach((key) => console.error(`   - ${key}`));
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  private_key_id: env.FIREBASE_PRIVATE_KEY_ID,
  private_key: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: env.FIREBASE_CLIENT_EMAIL,
  client_id: env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const auth = admin.auth();

async function setupFirebase() {
  console.log("🚀 Setting up Firebase for your project...\n");

  try {
    // 1. Create admin account if doesn't exist
    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;

    console.log("📝 Checking admin account...");

    try {
      const existingUser = await auth.getUserByEmail(adminEmail);
      console.log("✅ Admin account already exists:", existingUser.email);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        console.log("➕ Creating admin account:", adminEmail);
        const newUser = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: "Admin",
        });
        console.log("✅ Admin account created:", newUser.uid);
      } else {
        throw err;
      }
    }

    // 2. Deploy Firestore rules
    console.log("\n📋 Deploying Firestore rules...");

    try {
      execSync(
        `firebase deploy --only firestore:rules --project ${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
        { stdio: "inherit" },
      );
      console.log("✅ Firestore rules deployed successfully");
    } catch (err) {
      console.warn("⚠️  Could not deploy Firestore rules automatically.");
      console.warn("   Install Firebase CLI: npm install -g firebase-tools");
      console.warn("   Then run: firebase deploy --only firestore:rules");
    }

    console.log("\n✨ Setup completed! Your project is ready to deploy.\n");
    console.log("Next steps:");
    console.log("1. Commit: git add . && git commit -m 'Setup Firebase'");
    console.log("2. Push: git push");
    console.log("3. Vercel will deploy automatically");
  } catch (err) {
    console.error("❌ Setup failed:", err.message);
    process.exit(1);
  }
}

setupFirebase().finally(() => {
  admin.app().delete();
  process.exit(0);
});
