# NYPD Complaint Calibration Dashboard

A prediction-market-framed analysis of NYPD complaint data.  
Python notebook does the analysis; TypeScript dashboard visualizes the output.

**Live demo:** https://nypd-calibration.netlify.app/

---

## Project Structure

```
nypd-calibration/
├── analysis/
│   └── NYPD_Data_Analysis.ipynb    # Python analysis + JSON export
├── dashboard/
│   ├── public/
│   │   └── data/                   # JSON files consumed by the dashboard
│   │       ├── calibration.json
│   │       ├── timeseries.json
│   │       ├── borough_hour.json
│   │       └── conditional_probs.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── CalibrationChart.tsx
│   │   │   ├── TimeSeriesChart.tsx
│   │   │   ├── BoroughHeatmap.tsx
│   │   │   └── ConditionalProbChart.tsx
│   │   ├── types.ts
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── netlify.toml
├── .gitignore
└── README.md
```

---

## Step 1: Run the Python Notebook

The notebook downloads the NYPD dataset, runs the analysis, and exports four
JSON files to `dashboard/public/data/`.

### Prerequisites

```bash
pip install pandas numpy scipy matplotlib seaborn folium
```

You also need the `utils` module from your CS 439 course environment.

### Run

1. Open `analysis/NYPD_Data_Analysis.ipynb` in Jupyter.
2. Run all cells top to bottom. Parts 1-3 handle data ingestion and EDA.
   Part 4 runs the calibration analysis. Part 5 exports the JSON files.
3. Confirm four files were written:

```
dashboard/public/data/calibration.json
dashboard/public/data/timeseries.json
dashboard/public/data/borough_hour.json
dashboard/public/data/conditional_probs.json
```

> The repo ships with sample JSON files so the dashboard renders before
> you run the notebook. Replace them with real data by running the notebook.

---

## Step 2: Run the Dashboard Locally

```bash
cd dashboard
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Step 3: Deploy to Netlify

### Option A: Netlify CLI (fastest)

```bash
npm install -g netlify-cli
cd /path/to/nypd-calibration
netlify init        # connect to your Netlify account
netlify deploy --prod
```

### Option B: Connect GitHub (recommended for auto-deploy)

1. Push the repo to GitHub.

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/nypd-calibration.git
git push -u origin main
```

2. Go to [app.netlify.com](https://app.netlify.com) and click **Add new site > Import an existing project**.
3. Select your GitHub repo.
4. Netlify will auto-detect the `netlify.toml` config. No manual settings needed.
5. Click **Deploy site**.

After the first deploy, every `git push` to `main` triggers a redeploy automatically.

### Updating with New Data

```bash
# After re-running the notebook:
git add dashboard/public/data/
git commit -m "refresh analysis data"
git push
# Netlify auto-redeploys in ~30 seconds
```

---

## What the Dashboard Shows

| Panel | Description |
|---|---|
| **Calibration Curve** | Predicted P(felony) vs. actual P(felony) on the held-out test window. Points on the dashed diagonal = perfect calibration. |
| **Daily Volume** | Complaint count and felony rate over time. Dual-axis chart. |
| **Borough x Hour Heatmap** | Complaint density by borough and hour of day. Hover for felony rate. |
| **Conditional Probabilities** | P(crime type | borough) for the 8 most common offenses. |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Analysis | Python, pandas, numpy, scipy, matplotlib, seaborn |
| Dashboard | React 18, TypeScript, Vite |
| Charts | Recharts |
| Fonts | IBM Plex Mono, IBM Plex Sans |
| Deploy | Netlify (static site) |
