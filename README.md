# Baht ↔ Kyat Exchange

A mobile-first THB/MMK exchange calculator and daily transaction dashboard. Data is kept entirely in the browser with `localStorage`; no backend or account is required.

Buy and Sell rates are directly editable inside the Calculator card and save automatically.

Each transaction can include a customer name, phone number, and an explicit MMK → THB or THB → MMK exchange direction.

The dashboard has separate THB and MMK capital cards with bordered amount inputs. Values save automatically and remain independent of recorded transactions.

Daily THB and MMK cards show today’s net business movement: MMK → THB subtracts THB and adds MMK, while THB → MMK adds THB and subtracts MMK. Total net cards show opening capital plus all transaction movement through the latest record.

Desktop uses a viewport-fitted dashboard with an internally scrolling history list; mobile devices keep natural page scrolling.

The header includes a persistent light/dark theme toggle. The selected appearance is stored locally on the device.

## Local setup

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production build

The default GitHub Pages base path is `/currency_exchange/`, configured in `vite.config.js`.

```bash
npm run build
npm run preview
```

If the GitHub repository has a different name, build with its path:

```bash
VITE_BASE_PATH=/your-repository-name/ npm run build
```

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. The included `.github/workflows/deploy.yml` workflow will build and publish the app on every push to `main`.

The app stores rates under `exchange-rates-v4` and transactions under `exchange-transactions-v2` in browser `localStorage`. Older rate formats are converted automatically. Clearing browser site data clears these records.

## Accounting logic

- Rates are expressed as THB received for 100,000 MMK.
- Buy and Sell are customer actions: a customer buying THB means the business sells THB.
- Each transaction snapshots its business rate so later rate changes do not alter history.
