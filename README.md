# Personal Website

A personal landing page with a daily evolving style and a calendar archive.
Built with Vanilla HTML, CSS, and JavaScript.

## Features

- **Daily Theme**: A new theme (colors, fonts) is generated every day via GitHub Actions.
- **Calendar Archive**: Browse past versions of the website by selecting a date.
- **Self-Updating**: The "latest" style is automatically applied.

## Setup

1.  Clone the repository.
2.  Edit `public/profile.json` with your details.
3.  Run locally: `npx serve .` or `python3 -m http.server`.

## Deployment (Cloudflare Pages)

1.  Push this code to a GitHub repository.
2.  Go to [Cloudflare Pages](https://pages.cloudflare.com/).
3.  Connect your GitHub account and select the repository.
4.  **Build Settings**:
    - **Framework Preset**: None / Static HTML
    - **Build Command**: `exit 0` (No build needed for source files) or `node scripts/generate-theme.js` if you want to generate a fresh theme on deployment.
    - **Output Directory**: `.` (Root) or leave empty.
5.  Save and Deploy.

## Automation

The `.github/workflows/daily-theme.yml` workflow runs daily at 00:00 UTC.
It executes `scripts/generate-theme.js`, which:
1.  Creates a new JSON file in `public/archive/YYYY-MM-DD.json`.
2.  Updates `public/archive/latest.json`.
3.  Commits and pushes the changes back to the repo.

Cloudflare Pages will automatically redeploy when it detects the commit.
