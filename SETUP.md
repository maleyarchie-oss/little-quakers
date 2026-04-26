# Philadelphia Little Quakers – Platform Setup Guide

This guide walks you through everything you need to do to get the platform live.
Each step is written for someone who is not a developer — no coding knowledge required.

---

## What you need before you start

- A computer with a web browser
- Your domain: **littlequakers.com** (and access to change DNS settings)
- Your Stripe account (already set up)
- A Google account dedicated to the Little Quakers (e.g. littlequakersadmin@gmail.com)

---

## STEP 1 — Create a Supabase account (your database)

Supabase is where all player information is stored. It's free.

1. Go to **supabase.com** and click "Start your project" — sign up with your Google account.
2. Click "New Project". Name it "little-quakers". Choose a strong password and save it somewhere.
3. Wait about a minute for the project to be created.
4. Go to **Settings → API** (left sidebar). You will see:
   - **Project URL** — copy this (looks like `https://xxxxx.supabase.co`)
   - **anon public** key — copy this
   - **service_role** key — copy this (click the eye icon to reveal)
5. Go to **SQL Editor** (left sidebar), click "New Query", paste the entire contents of `supabase-schema.sql`, and click "Run". This sets up all the tables.

---

## STEP 2 — Create a Resend account (for sending emails)

Resend is what sends all the automatic emails. It's free for the volume you need.

1. Go to **resend.com** and sign up.
2. Go to **Domains** and add `littlequakers.com`. Follow their instructions to add DNS records (they'll tell you exactly what to add).
3. Once the domain is verified, go to **API Keys** and create a new key. Copy it.
4. The FROM address should be: `info@littlequakers.com`

---

## STEP 3 — Create a Google Service Account (for Drive + Sheets)

This lets the platform automatically upload files to your Google Drive and create spreadsheets.

1. Go to **console.cloud.google.com** and sign in with your Little Quakers Google account.
2. Create a new project — name it "little-quakers".
3. Go to **APIs & Services → Library**. Enable these two:
   - **Google Drive API**
   - **Google Sheets API**
4. Go to **APIs & Services → Credentials**. Click "Create Credentials" → "Service Account".
   - Name it "little-quakers-service"
   - Click through to finish
5. Click on the service account you just created → go to **Keys** tab → "Add Key" → "Create new key" → JSON → Download.
6. Open that JSON file in a text editor. You'll need to paste the whole thing (it's all on one line) into your environment variables.
7. **Share your Google Drive folder** with the service account email (looks like `little-quakers-service@your-project.iam.gserviceaccount.com`). Give it "Editor" access.

---

## STEP 4 — Deploy to Vercel (your web host)

Vercel hosts the website for free.

1. Go to **vercel.com** and sign up with your GitHub account.
2. Push this project to GitHub (ask someone to help with this one-time step if needed).
3. In Vercel, click "Add New Project" and import your GitHub repo.
4. Before clicking Deploy, go to **Environment Variables** and add ALL of the following:

```
NEXT_PUBLIC_SUPABASE_URL          = (your Supabase Project URL from Step 1)
NEXT_PUBLIC_SUPABASE_ANON_KEY     = (your Supabase anon key from Step 1)
SUPABASE_SERVICE_ROLE_KEY         = (your Supabase service_role key from Step 1)
RESEND_API_KEY                    = (your Resend API key from Step 2)
EMAIL_FROM                        = info@littlequakers.com
GOOGLE_SERVICE_ACCOUNT_JSON       = (paste the entire contents of your service account JSON file)
GOOGLE_DRIVE_FOLDER_ID            = (leave blank — the platform will create the folder automatically)
JWT_SECRET                        = (generate a random string — go to passwordsgenerator.net, 32 characters)
CRON_SECRET                       = (generate another random string — 32 characters)
```

5. Click "Deploy". Wait about 2 minutes.
6. Connect your domain: in Vercel, go to **Settings → Domains** and add `littlequakers.com`. Follow the DNS instructions they give you.

---

## STEP 5 — Create your first admin account

The platform comes with no admin accounts by default. You need to create the first one via the database.

1. In Supabase, go to **SQL Editor** and run this (replace the values):

```sql
INSERT INTO admin_users (name, username, email, password_hash)
VALUES (
  'Your Name',
  'yourusername',
  'your@email.com',
  '$2b$12$REPLACE_THIS_WITH_BCRYPT_HASH'
);
```

To generate the bcrypt hash for your password:
- Go to **bcrypt-generator.com**
- Type your password, use cost factor 12
- Copy the result and paste it in place of `$2b$12$REPLACE_THIS_WITH_BCRYPT_HASH`

2. After running the SQL, go to `littlequakers.com/admin/login` and sign in.
3. From the Admin Portal → **Admin Accounts**, you can add the other 2 admin users through the interface.

---

## STEP 6 — Set up the platform for your first season

Once you're logged in to the admin portal:

1. Go to **Settings**:
   - Set your **tryout date, time, and location**
   - Paste your **Stripe payment link**
   - Click **Create Calendar Google Sheet** — this creates the calendar spreadsheet and connects it automatically
   - Toggle **Registration OPEN** when you're ready

2. Share the calendar Google Sheet link with your coaches — they update it directly in Google Sheets.

3. **The iCal subscribe link** for families is at `littlequakers.com/api/ical` — they can add this to Apple Calendar or Google Calendar.

---

## STEP 7 — Set up the reminder email cron job

The platform needs to check every day whether to send reminder emails (2 weeks, 1 week, 1 day before tryouts).
Vercel handles this automatically via the `vercel.json` config (runs at 9am every day).

For the cron to work, you need to add the CRON_SECRET to your Vercel environment variables (done in Step 4).

---

## Day-to-day usage

| Task | Where to do it |
|------|---------------|
| Open/close registration | Admin → Settings |
| View all registrants | Admin → Registrants |
| Export registrant CSV | Admin → Registrants → Export CSV |
| Select the team | Admin → Team Selection (drag & drop) |
| Assign jersey numbers | Admin → Final Roster |
| Export roster to Google Sheets | Admin → Final Roster → Export |
| Send team result emails | Admin → Team Selection → Send Team Emails |
| Send a broadcast email | Admin → Broadcast Email |
| Update calendar | Open the Calendar Google Sheet directly |
| Add/remove admin users | Admin → Admin Accounts |

---

## Registrant documents in Google Drive

Every birth certificate and report card uploaded during registration is automatically saved to your Google Drive in a folder called **"Little Quakers Registrants"**. Each file is named like: `Player Name - Birth Certificate - filename.pdf`.

---

## Need help?

If something isn't working, the most common issues are:
- **Environment variables** — double-check all values in Vercel are correct
- **Google service account** — make sure the API is enabled and the JSON is pasted correctly (no line breaks)
- **Resend domain** — make sure DNS records are verified before emails will send
