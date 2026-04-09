# ECC Frontend Portfolio Demo

This repository is a portfolio-safe frontend adaptation of the original Elevate Capital Collective dashboard.

The live backend, authentication, Supabase integration, and external market-price fetching were removed so the project can be showcased as a polished standalone product demo. The current build runs entirely on local mock data while preserving the overall product flow and UI depth.

## What This Demo Shows

- A premium investment-club dashboard experience built with React and Vite
- Portfolio, installment, member-management, notification, and account-settings screens
- Interactive charts powered by Recharts
- Admin and member style flows using seeded local data
- Light and dark theme support
- Fully frontend-only behavior suitable for portfolio presentation

## Demo Highlights

- Mock authentication flow for login, signup, password reset, and profile settings
- Local demo data layer that simulates:
  - members
  - installments
  - holdings
  - notifications
  - stock prices
- Admin actions such as:
  - adding holdings
  - adding installments
  - inviting members
  - sending notifications
- Responsive UI for desktop and mobile layouts

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Recharts
- Lucide React

## Local Development

```bash
npm install
npm run dev
```

To preview a production build:

```bash
npm run build
npm run preview
```

## Demo Credentials

Use any seeded demo email on the login screen.

Suggested account:

- `khush@ecc-demo.dev`

The password is only part of the frontend demo flow and is not validated against a backend.

## Project Structure

```text
src/
  components/        Reusable layout and admin UI pieces
  context/           Theme and demo data providers
  data/              Seeded mock portfolio data
  hooks/             Lightweight hooks for auth and dashboard access
  pages/             Route-level screens
```

## Portfolio Note

This version is intentionally frontend-only. Sensitive business logic, production integrations, live credentials, and backend dependencies were removed to make the project safe to publish and easy to demo.
