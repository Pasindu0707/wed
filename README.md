## Wedding Checklist (live, shared)

Mobile-first wedding day checklist web app (Next.js App Router + MongoDB/Mongoose).

### Requirements

- Node **20 LTS** (or Node 18.17+)
- MongoDB Atlas connection string

### Environment variables (local + Vercel)

- **`MONGODB_URI`**: MongoDB Atlas connection string
- **`NEXT_PUBLIC_APP_URL`**: Your app base URL (e.g. `https://your-app.vercel.app`)

### Setup

1. Copy env file:

```bash
cp .env.example .env.local
```

2. Set:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_APP_URL`

3. Install + run:

```bash
npm install
npm run dev
```

### Seed the wedding data

This app uses a shareable slug URL like `/wedding/suhashi-darshana`.

Seed (or re-seed) the wedding checklist + inventory + shots + references:

```bash
npm run seed:wedding
```

Open `http://localhost:3000/wedding/suhashi-darshana`.

### Import timeline items from PDFs (developer workflow)

1. **Read the PDF agenda**
2. **Convert it into JSON** with this format (see `data/timeline.sample.json`):

```json
[
  {
    "time": "5:45 PM",
    "title": "Confirm full hotel setup",
    "location": "Suriya Resort",
    "description": "Check seating plan, 43 tables, chairs, cake, deco, napkins, side plates, cutlery, cake boxes",
    "status": "pending",
    "sortOrder": 1
  }
]
```

3. **Run the importer** (defaults to `suhashi-darshana` and `data/timeline.sample.json`):

```bash
npm run import:timeline
```

Optional flags:
- `--slug suhashi-darshana`
- `--file data/my-timeline.json`
- `--replace` (delete existing timeline items first)

4. **Confirm in the app**
- Open `http://localhost:3000/wedding/suhashi-darshana/timeline`

Note: the importer expects you to do the PDF→JSON step first. When PDFs are provided later, we can automate extraction and insert as `TimelineItem` records.

## Deploy to Vercel (production)

### 1) MongoDB Atlas setup

1. **Create a cluster**
   - MongoDB Atlas → Build a Database → choose a cluster (M0/M2 is fine to start).
2. **Create a database user**
   - Database Access → Add New Database User → username/password.
3. **Allow network access**
   - Network Access → Add IP Address
   - For quick setup: allow `0.0.0.0/0` (not ideal long-term, but simplest).
   - Better: restrict to the IPs you need later.
4. **Copy connection string**
   - Database → Connect → Drivers → copy the `mongodb+srv://...` string
   - Replace `<user>` and `<password>` with your database user credentials.

### 2) Create Vercel project

1. Push this folder to GitHub (or import the local folder into Vercel).
2. Vercel → New Project → select repository → Framework: Next.js.

### 3) Add Vercel environment variables

In Vercel Project → Settings → Environment Variables:

- `MONGODB_URI` = your Atlas connection string
- `NEXT_PUBLIC_APP_URL` = `https://<your-project>.vercel.app`

### 4) Production build check (recommended)

Run locally before deploying:

```bash
npm run check:prod
```

### 5) Deploy commands (final checklist)

```bash
npm install
npm run seed:wedding
npm run build
vercel deploy
```

### Deploy (Vercel)

- Add the same env vars in Vercel Project Settings.
- Deploy.

