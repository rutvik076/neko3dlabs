# Neko3DLabs — Firebase + Cloudinary Setup Guide

## Stack (100% Free)
| Service         | Purpose                    | Free Tier                        |
|-----------------|----------------------------|----------------------------------|
| Firebase Auth   | Admin login                | Unlimited (Spark plan)           |
| Firestore       | Database                   | 1GB storage, 50K reads/day       |
| Cloudinary      | Image/video/file uploads   | 25GB storage, 25GB bandwidth/mo  |

> ⚠️ Firebase Storage requires Blaze (paid) plan — we use Cloudinary instead.

---

## Step 1 — Create Firebase Project (Spark free plan)
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `neko3dlabs` → click through
3. Stay on **Spark (free)** plan — no upgrade needed

---

## Step 2 — Enable Authentication
1. Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** → **Email/Password** → Enable → Save
3. **Users** tab → **Add user** → enter your admin email + password

---

## Step 3 — Create Firestore Database
1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Production mode** → select your region → **Done**

### Firestore Security Rules
Go to **Firestore → Rules**, replace everything with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /participants/{id} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }

    match /orders/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /winners/{id} {
      allow read: if resource.data.is_published == true;
      allow read, write: if request.auth != null;
    }

    match /settings/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
Click **Publish**.

---

## Step 4 — Create Cloudinary Account (FREE)
1. Go to https://cloudinary.com → **Sign up free** (no credit card)
2. Note your **Cloud Name** from the dashboard

### Create an Upload Preset
1. Cloudinary Dashboard → **Settings** (gear icon) → **Upload**
2. Scroll to **Upload presets** → **Add upload preset**
3. Set:
   - **Preset name**: `neko3dlabs_unsigned`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `neko3dlabs` (optional)
4. Click **Save**

---

## Step 5 — Get Firebase Credentials

### Client SDK (for .env.local)
1. Firebase Console → **Project Settings** (gear) → **General**
2. Scroll to **Your apps** → click your web app (or **Add app** → Web)
3. Copy the `firebaseConfig` values

### Admin SDK (for .env.local)
1. Firebase Console → **Project Settings** → **Service accounts**
2. Click **Generate new private key** → Download JSON
3. Copy from the JSON:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

---

## Step 6 — Fill .env.local
```bash
cp .env.local.example .env.local
# Then fill in all values
```

---

## Step 7 — Initialize Settings Document
Open your deployed site → go to `/admin/settings` → fill in your details → **Save**.
This creates the `settings/main` Firestore document automatically.

Or manually in Firestore Console:
- Collection: `settings`
- Document ID: `main`
- Fields: `site_name`, `youtube_url`, `whatsapp_number`, `banner_text` (string), `banner_enabled` (boolean = false)

---

## Step 8 — Deploy to Vercel
In **Vercel Dashboard → your project → Settings → Environment Variables**, add every variable from `.env.local.example`.

For `FIREBASE_ADMIN_PRIVATE_KEY`:
- Paste the full key including `-----BEGIN PRIVATE KEY-----` header
- Use actual newlines (Vercel handles them correctly in the UI)
