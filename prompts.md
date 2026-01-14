# Personal Website - Prompt History

This file documents the evolution of the project through the prompts and requests made during the development session.

## System & Project Foundation
- **Project Setup**: Create a personal website using Vanilla JavaScript, HTML, and CSS (strictly avoiding frameworks like React/Next.js).
- **Automation (GitHub Actions)**: Configure a daily cron job (`0 0 * * *`) that runs a Node.js script to generate a new aesthetic and pushes the change to the repository automatically.
- **Deployment**: Design for deployment on **Cloudflare Pages** to serve the static content and archive.
- **Data Structure**: Use a `profile.json` file for personal information and an archive system for daily themes.
- **Theming**: Implement a system that generates and applies a new aesthetic (colors + fonts) every day.
- **Automation**: Create a Node.js script (`scripts/generate-theme.js`) to generate theme JSON files and a GitHub Workflow (`daily-theme.yml`) to automate this daily at midnight.
- **Shared Config**: Centralize palettes, fonts, and layouts in `public/theme-config.json` so browser code and Node.js scripts share the same source of truth.
- **Typography**: Use premium font pairings like 'Fraunces' (serif) and 'Inter' (sans-serif).

## Features & Logic
- **Experience Section**: Add a structured list of past roles and descriptions.
- **Dynamic Layouts**: Implement multiple layout variations (`split`, `reversed`, `stacked`, `hero`) that change with the theme.
- **Calendar Archive**: Create a floating "Archive" button that opens a calendar to browse past daily styles.
- **URL Integration**: Synchronize the selected date with the URL query string (`?date=YYYYMMDD`).
- **Theme Fallback**: Implement logic to load a default or fallback style if the theme for a specific date is missing.
- **Remix Button**: Add a floating "Remix" button that lets users trigger a one-time random reshuffle of CSS variables (palette, font, layout) if they don't like the current style.
- **Social Integration**: Add LinkedIn and GitHub profile links with consistent styling.
- **Quote**: Add a random quote in the header. Each time the page reloads, the quote changes.

## Design & Aesthetics
- **Bento Grid**: Refactor the layout of the Experience section into a modular Bento Grid system with rounded corners and consistent padding.
- **Mobile Optimization**: Ensure the mobile layout correctly stacks sections, keeping the profile at the top regardless of the desktop layout variation.
- **Interactive Headers**: Make headers react to cursor movement (variable font weight/optical size) and reveal on scroll.
- **Glassmorphism**: Use blurred backgrounds (`backdrop-filter`) and multi-layered shadows to create depth and visual layers.

## Footer & Attribution
- **Credit**: Include "Inspired by arnaud.ai" with a clickable link in the footer.
- **Timestamp**: Show the "Style generated on" date dynamically.

## User Manual Refinements
- **Constraint Refinements**: Simplified card shadows and borders to maintain a more subtle, minimalist aesthetic.

## Verification & Validation
- **Local Testing**: Verify the project using a simple HTTP server (Python/Node).
- **Data Integrity**: Ensure `profile.json` renders correctly and the calendar identifies valid dates (blocking future/too-far-past dates).

