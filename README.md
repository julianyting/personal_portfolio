# Julian Ting — Portfolio

Personal portfolio site for Julian Ting, Data Science @ Chapman University (CO 2027).
Built with React and Vite, themed around a sportsbook/casino table.

**Live sections:** About · Skills · Projects · Bucket List · Contact
**Dedicated page:** [`/roulette`](#roulette-simulator) — an interactive roulette simulator

## Roulette Simulator

The centrepiece project, at `/roulette`. A playable roulette table wrapped around a
statistics engine that shows why the house always wins.

**Simulator**
- American (0/00) and European (0) wheels, switchable — 5.26% vs 2.70% house edge
- Full bet board: straight up, splits, streets, dozens, columns, red/black, odd/even, high/low
- Splits and streets are placed on the lines *between* numbers, the way a real felt works
- Animated SVG wheel with a counter-rotating ball that settles into the winning pocket
- User-defined starting bankroll, chip denominations, and auto-play at three speeds

**Statistical dashboard**
- Session stats: spins, win %, net P&L, ROI, total wagered
- Running bankroll chart plotted over every spin
- Live expected-value readout per bet, and blended EV for the whole board
- Hot/cold frequency heat map across every pocket, against the expected count
- Current and longest win/loss streaks

**The Truth Panel**
- Long-run projection: expected loss at your current stake over 100/500/1000 spins, with a 1σ band
- Law of large numbers: 10,000 simulated spins plotted converging on 47.37%
- Bets ranked by EV — every one is identical at −5.26%; only volatility differs
- Gambler's fallacy buster: empirical P(red | previous was red), which stays at 47.37%

**Strategy lab**
- Martingale Monte Carlo over 2,000 trials — ruin rate, spins survived, peak bet, sample run
- "What if" projector for any bet type and stake across 100/500/1000 spins

All probability, payout, and EV figures are computed in `src/utils/roulette.js` from the
wheel model itself, so the displayed odds cannot drift from the simulation that produces them.

## Tech stack

React 19 · Vite · Tailwind CSS · Framer Motion · React Router · react-icons

Charts are hand-rolled inline SVG — no charting dependency.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run lint     # eslint
```

## Project structure

```
src/
  pages/            route-level components (Home, RoulettePage)
  components/       portfolio sections (Hero, About, Skills, Projects, …)
    roulette/       simulator sub-components (Wheel, BetBoard, TruthPanel, …)
  utils/
    roulette.js     pure roulette maths — wheel layouts, payouts, EV, Monte Carlo
    motionVariants.js
  assets/
```

## Deployment

Deployed to GitHub Pages by `.github/workflows/deploy.yml`, which builds on every push to
`master` and publishes `dist/`. The Pages source must be set to **GitHub Actions** in
repository settings (Settings → Pages → Build and deployment → Source).

Two details make client-side routing work on Pages:

- `vite.config.js` sets `base: '/personal_portfolio/'`, since a project site is served from
  a subpath. `BrowserRouter` reads the same value via `import.meta.env.BASE_URL`, so the
  router and the asset paths cannot disagree. Change both to `/` for a domain root.
- `npm run build` copies `dist/index.html` to `dist/404.html`. Pages serves `404.html` for
  unknown paths, so a direct link to `/roulette` still boots the app.
