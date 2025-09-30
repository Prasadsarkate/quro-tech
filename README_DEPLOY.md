Quick deploy guide — Vercel + Supabase (free)

This file gives exact, minimal steps to publish this Next.js app using Vercel and Supabase.

1) Push code to GitHub
- Create a repo on GitHub and push your code:
  git add .
  git commit -m "ready for deploy"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
  git push -u origin main

2) Create Supabase project (free)
- Go to https://app.supabase.com and create a new project (Hobby / free tier).
- Copy these values from the Supabase dashboard (Project -> Settings -> API):
  - Project URL (e.g. https://xyz.supabase.co)
  - anon key
  - service_role key (keep secret)

3) Run DB migrations
- In Supabase → SQL Editor → paste & run the SQL scripts found in this repo's `scripts/` folder.
- Recommended order (run each file in the SQL editor):
  - scripts/001_create_profiles_table.sql
  - scripts/002_create_certificates_table.sql
  - scripts/003_create_payments.sql
  - scripts/create-orders-table.sql
  - scripts/sql/004_update_orders_for_razorpay.sql

4) Edit Supabase Auth email template (optional)
- Supabase -> Authentication -> Templates -> Confirm email
- Update the Confirm Email template to match your brand.

5) Setup Vercel and environment variables
- Create a Vercel account (https://vercel.com) and import your GitHub repo.
- Add the environment variables in Vercel (Project -> Settings -> Environment Variables):
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY (server-only)
  NEXT_PUBLIC_SITE_URL (e.g. https://your-app.vercel.app)
  NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL (optional)
  STRIPE_PUBLISHABLE_KEY (optional for Stripe)
  STRIPE_SECRET_KEY (optional for Stripe, server-only)
  RAZORPAY_KEY_ID (optional)
  RAZORPAY_KEY_SECRET (optional, server-only)

6) Deploy and test
- Vercel deploys automatically after import. Visit your site.
- Test signup, email confirmation, login, payment (Stripe test keys / Razorpay demo), and certificate issuance.

7) Local development
- Create a `.env.local` file in repo root with values from Supabase and Stripe (see `.env.local.example`).
- Run locally:
  npm install
  npm run dev

If you want, I can automate creating `.env.local.example` for you or walk through the Supabase SQL steps interactively.

---
Small troubleshooting tips
- If build fails on Vercel, check the build logs for missing env vars.
- If Supabase returns PGRST205 'table not found', run the matching SQL script to create the table.
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (only store in server environment variables).

Thank you — tell me if you want me to add a one-click deployment link or a custom `vercel.json`.