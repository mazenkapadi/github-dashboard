# GitHub Metrics Dashboard

A minimal, focused GitHub analytics dashboard built with **Next.js App Router**, **TypeScript**, **Tailwind CSS v4**, **Supabase** (for caching), and **GitHub’s REST + GraphQL APIs**.

It gives you a single-page view of:

- Profile summary (avatar, bio, followers, location)
- Top repositories (stars, forks, language)
- Aggregated stats (total stars, forks, yearly contributions, current streak)
- Language breakdown (pie chart powered by Recharts)
- Contribution activity heatmap (7 / 30 / 365 day ranges)

You can quickly switch between any GitHub username from the header search field.

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Required environment variables

Create a `.env.local` file and set:

```bash
GITHUB_TOKEN=ghp_your_personal_access_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

- `GITHUB_TOKEN` must have access to the GitHub REST and GraphQL APIs (a classic PAT with `repo` and `read:user` scopes is usually enough for public data).
- `SUPABASE_SERVICE_ROLE_KEY` is only used server-side for caching; it must **never** be exposed in the browser.

### 3. Run the dev server

```bash
npm run dev
```

Then open `http://localhost:3000`.

By default the home page shows the dashboard for `mazenkapadi`, but you can change the username from the header search input.

---

## Architecture

- **App routes**
  - `app/page.tsx` – root page, renders the dashboard for a default username.
  - `app/github/[username]/page.tsx` – dynamic page for any GitHub username.
  - `app/api/github/stats/route.ts` – main data API that returns the full `GithubStatsResponse` object and uses Supabase as a cache.
  - `app/api/github/contributions/route.ts` – exposes raw contribution data for a given user.

- **Components** (in `components/github`)
  - `GitHubDashboard` – client component that:
    - Manages the active username and input field.
    - Fetches stats from `/api/github/stats`.
    - Handles loading and error states while keeping the last successful data visible.
  - `UserCard` – profile summary card.
  - `TopRepositories` – top repositories by stars.
  - `StatisticsPanel` – key totals (stars, forks, yearly contributions, streak).
  - `LanguageBreakdown` – Recharts pie chart of language share.
  - `ContributionHeatmap` – 7 / 30 / 365 day activity heatmap.

- **Data & caching**
  - `lib/github/client.ts` – GitHub REST + GraphQL client.
  - `lib/github/metrics.ts` – aggregates user, repos, languages and contributions into a single payload.
  - `lib/github/contributions.ts` – pulls contribution calendar via GitHub GraphQL and computes the current streak.
  - `lib/cache/supabaseClient.ts` – Supabase server client.
  - `lib/cache/cacheManager.ts` – simple TTL cache layer on top of Supabase.

- **Types**
  - `types/github.ts` – shared TypeScript types for user, repos, languages, and contributions.

---

## Usage

1. Visit `/` or `/github/<username>`.
2. Use the header search field to enter any GitHub username and hit **View**.
3. If a username fails to load, you’ll see an inline error but the last successful dashboard stays visible, so you can try another username without leaving the page.

---

## Development notes

- Built with Next.js 16, React 19, Tailwind CSS v4, and Recharts.
- Linting: `npm run lint`.
- Supabase is optional in local dev if you wire the env vars to a test project, but the code assumes they are present.

You can extend this dashboard with additional panels (issues, PRs, organizations, etc.) or plug in your own persistence layer instead of Supabase if you prefer.
# GitHub-dashboard
