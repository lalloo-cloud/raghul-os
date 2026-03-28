# Raghul // Daily Command Center

## Setup (one time)

```bash
npm create vite@latest raghul-command-center -- --template react
cd raghul-command-center
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion
```

## Drop in the files

Replace everything in `src/` with the provided files:
- src/main.jsx
- src/index.css
- src/App.jsx
- src/Dashboard.jsx
- src/WeeklyOverview.jsx
- src/MonthOverview.jsx
- src/CommandTabs.jsx

Replace `tailwind.config.js` in the root.

## Run

```bash
npm run dev
```

Open http://localhost:5173

## File structure

```
raghul-command-center/
├── src/
│   ├── main.jsx          ← entry point
│   ├── index.css         ← tailwind + base styles
│   ├── App.jsx           ← state manager (localStorage)
│   ├── Dashboard.jsx     ← header, anchors, tabs, day view
│   ├── WeeklyOverview.jsx
│   ├── MonthOverview.jsx
│   └── CommandTabs.jsx
└── tailwind.config.js
```

## What's wired

- Real-time PT clock, live block detection, day progress
- Auto-switches Spring Break / School schedule (Mar 30 cutoff)
- Check-in system for Trading, Physics, Rotating Skill
- Streak tracker (current + best)
- Night-before skill lock-in persists to next day
- Week view: 7-day grid with per-day completion
- Month view: calendar with click-to-inspect any day
- Export JSON + Reset
- Framer Motion animations throughout
- localStorage persistence
