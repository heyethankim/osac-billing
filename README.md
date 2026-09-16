# OSAC Billing Prototype

PatternFly React prototype for OSAC billing and M360 integration:

- **M360 portal** — billing accounts
- **Provider admin** — register tenant, billing account and rate card assignment
- **OSAC surfaces** — catalog publish gates, launch cost, billing & metering

## Local development

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://127.0.0.1:5184/`).

## Live demo (GitHub Pages)

After deployment is enabled, the demo is published at:

**https://heyethankim.github.io/osac-billing/**

Pushes to `main` rebuild and redeploy automatically via GitHub Actions.

### First-time GitHub Pages setup

1. Open [osac-billing Settings → Pages](https://github.com/heyethankim/osac-billing/settings/pages)
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Run **Actions** → **Deploy to GitHub Pages** → **Re-run all jobs**
4. When the workflow succeeds, open the live URL above (may take 1–2 minutes)

If **GitHub Actions** is unavailable, use **Deploy from a branch** → branch **`gh-pages`** → folder **`/ (root)`**, then save.
