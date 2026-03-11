# 🐱 Neko3DLabs — Deployment Guide

## Tech Stack
- **Frontend + Backend**: Next.js 14 (App Router) on **Vercel**
- **Database + Storage + Auth**: **Supabase**
- **Version Control**: **GitHub**

---

## ✅ Step 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `neko3dlabs`, choose your region, set a strong password
3. Wait for project to provision (~2 min)

### Create the database tables

1. Go to **SQL Editor** in Supabase dashboard
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run** — all tables, RLS policies, and sample data will be created

### Create Storage Buckets

Go to **Storage** → **New Bucket** and create:

| Bucket Name       | Public? |
|-------------------|---------|
| product-images    | ✅ Yes  |
| product-videos    | ✅ Yes  |
| screenshots       | ❌ No   |
| shipping-proofs   | ❌ No   |

For each **public** bucket, go to Policies → Add policy → Allow public SELECT.

### Create Admin User

1. Go to **Authentication** → **Users** → **Add User**
2. Enter your email and a strong password
3. This is your admin login for `/admin`

### Get API Keys

Go to **Settings** → **API**:
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Step 2 — Set Up GitHub

```bash
# In the neko3dlabs folder
git init
git add .
git commit -m "🐱 Initial commit — Neko3DLabs"

# Create repo on github.com then:
git remote add origin https://github.com/YOUR_USERNAME/neko3dlabs.git
git branch -M main
git push -u origin main
```

---

## ✅ Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your **GitHub repo**
3. Framework: **Next.js** (auto-detected)
4. Click **Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY         = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_WHATSAPP_NUMBER       = 60123456789
NEXT_PUBLIC_YOUTUBE_URL           = https://youtube.com/@yourchannel
NEXT_PUBLIC_SITE_NAME             = Neko3DLabs
```

5. Click **Deploy** 🚀

Your site will be live at `https://neko3dlabs.vercel.app` (or custom domain)

---

## ✅ Step 4 — Local Development

```bash
cd neko3dlabs

# Install dependencies
npm install

# Create env file
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys

# Run dev server
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
neko3dlabs/
├── app/
│   ├── page.tsx              # Home (product grid)
│   ├── products/[id]/page.tsx # Product detail
│   ├── lucky/page.tsx        # Lucky draw
│   ├── winners/page.tsx      # Winners
│   ├── admin/
│   │   ├── layout.tsx        # Auth gate
│   │   ├── page.tsx          # Dashboard
│   │   ├── products/page.tsx # Product CRUD
│   │   ├── participants/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── winners/page.tsx
│   │   └── settings/page.tsx
│   └── api/orders/route.ts
├── components/
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── HeroSection.tsx
│   ├── LuckyDrawForm.tsx
│   ├── FloatingButtons.tsx
│   ├── YTPopup.tsx
│   ├── WinnerBanner.tsx
│   ├── ToastProvider.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       └── AdminLoginForm.tsx
├── lib/
│   ├── supabase.ts           # DB + Storage client
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Helpers
├── supabase/
│   └── schema.sql            # Full DB schema
└── public/
    └── logo.png              # Your Neko logo
```

---

## 🔄 Update Flow

```bash
# Make changes locally → auto-redeploys to Vercel on push
git add .
git commit -m "update: product card design"
git push
```

Vercel auto-deploys every push to `main`. 🎉

---

## 🐱 Admin Panel

- URL: `your-domain.com/admin`
- Login with the Supabase Auth user you created
- Manage products (upload images + videos), approve participants, pick winners

---

## 💡 Tips

- Use **Supabase Table Editor** for bulk data management
- Enable **Supabase Realtime** on `participants` table to get live notifications
- Add a **custom domain** in Vercel → Settings → Domains
- Use **Vercel Analytics** (free) for page view tracking
