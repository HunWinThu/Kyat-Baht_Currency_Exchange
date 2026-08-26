# Baht ↔ Kyat Exchange

A mobile-first THB/MMK exchange calculator and daily transaction dashboard. Supabase provides authenticated permanent cloud storage, while `localStorage` remains as a local cache.

Buy and Sell rates are directly editable inside the Calculator card and save automatically.

Each transaction can include a customer name, phone number, and an explicit MMK → THB or THB → MMK exchange direction.

Transaction History includes Today, calendar-date, and All filters for reviewing records from a specific day.

The dashboard has separate THB and MMK capital cards with bordered amount inputs. Values save automatically and remain independent of recorded transactions.

Daily THB and MMK cards show today’s net business movement: MMK → THB subtracts THB and adds MMK, while THB → MMK adds THB and subtracts MMK. Total net cards show opening capital plus all transaction movement through the latest record.

Desktop uses a viewport-fitted dashboard with an internally scrolling history list; mobile devices keep natural page scrolling.

The header includes a persistent light/dark theme toggle. The selected appearance is stored locally on the device.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your Supabase Project URL and publishable key to `.env.local`, then open the local URL shown by Vite. Never use a Supabase `service_role` key in this app.

## Supabase setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it once. This creates the transaction/settings tables and owner-only Row Level Security policies.
3. Open the project **Connect** dialog and copy the Project URL and publishable key into `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

4. Under **Authentication → URL Configuration**, set the production Site URL to:

```text
https://hunwinthu.github.io/Kyat-Baht_Currency_Exchange/
```

5. Add the local development URL and the production URL to the allowed redirect URLs.
6. Start the app and create the first account. If this is a private single-user app, disable additional public sign-ups afterward in Supabase Authentication settings.

On first sign-in, existing local transactions are uploaded to the signed-in account. New records, deletions, rates, and capital values then synchronize with Supabase. A red cloud icon indicates a sync error and can be clicked to retry.

## Production build

The default GitHub Pages base path is `/Kyat-Baht_Currency_Exchange/`, configured in `vite.config.js`.

```bash
npm run build
npm run preview
```

If the GitHub repository has a different name, build with its path:

```bash
VITE_BASE_PATH=/your-repository-name/ npm run build
```

## iOS app with Capacitor

The existing React application is packaged as a native iOS app with Capacitor; no Swift rewrite is required.

Requirements:

- Node.js 22+
- Xcode 26+
- Xcode Command Line Tools

Build the web bundle and synchronize it into the native iOS project:

```bash
npm run ios:sync
```

Open the generated project in Xcode:

```bash
npm run ios:open
```

In Xcode, select the `App` target, choose a simulator or connected iPhone, select your Apple development team under **Signing & Capabilities**, and press Run. The bundle identifier is `com.ktoo.moneydesk` and the display name is `Money Desk by Ktoo`.

After future React changes, run `npm run ios:sync` before rebuilding in Xcode.

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. Under **Settings → Secrets and variables → Actions**, add these repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. The included `.github/workflows/deploy.yml` workflow will build and publish the app on every push to `main`.

The app keeps local cache keys for offline resilience and migration. Clearing browser data does not delete records that have successfully synchronized to Supabase.

## Install on iPhone as a PWA

The GitHub Pages build includes a web app manifest, Home Screen icons, standalone display mode, automatic service-worker updates, and offline app-shell caching.

1. Open the deployed GitHub Pages URL in Safari on the iPhone.
2. Tap **Share**, then **Add to Home Screen**.
3. Enable **Open as Web App** and tap **Add**.
4. Launch **Money Desk** from the Home Screen and sign in once.

The installed PWA has storage separate from Safari and the Capacitor app. Supabase restores the signed-in user's cloud records. Offline mode can load cached application files and local data; cloud synchronization resumes when the network is available.

## Accounting logic

- Rates are expressed as THB received for 100,000 MMK.
- Buy and Sell are customer actions: a customer buying THB means the business sells THB.
- Each transaction snapshots its business rate so later rate changes do not alter history.
