# Baht ↔ Kyat Exchange

A mobile-first THB/MMK exchange calculator and daily transaction dashboard. Data is kept entirely in the browser with `localStorage`; no backend or account is required.

Each transaction can include a customer name, phone number, and an explicit MMK → THB or THB → MMK exchange direction.

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

The app stores rates under `exchange-rates-v3` and transactions under `exchange-transactions-v2` in browser `localStorage`. Older rate formats are converted automatically. Clearing browser site data clears these records.

## Accounting logic

- Rates are expressed as THB received for 100,000 MMK.
- Buy and Sell are customer actions: a customer buying THB means the business sells THB.
- Customer-buy profit: received MMK minus the THB value at the Market Buy reference.
- Customer-sell profit: THB value at the Market Sell reference minus the MMK paid.
- Capital is the business cost basis for each transaction.
- Each transaction snapshots its business rate and market rate so later rate changes do not alter history.
