# FounderOS

Local-first desktop OS for founders. 30 apps in 30 days.

No subscriptions. No cloud. No accounts. BYOK AI. Everything runs locally.

## Stack

- **Electron** - native desktop shell
- **Python + FastAPI** - local backend on port 8765
- **SQLite** - data lives at `~/.founder-os/data.db`
- **Vanilla JS** - no framework overhead

## Setup

```bash
# 1. Install JS dependencies
npm install

# 2. Install Python dependencies
pip3 install -r backend/requirements.txt

# 3. Run
npm start
```

## Apps

| Day | App | Status |
|-----|-----|--------|
| 01  | Focus Timer | done |
| 02  | Time Tracker | coming |
| 03  | Distraction Log | coming |
| 04  | Focus Analytics | coming |
| 05  | Founder Daily Planner | coming |
| 06  | Meeting Timer | coming |
| 07  | Weekly Review | coming |
| 08  | Quick Notes | coming |
| 09  | Voice Notes | coming |
| 10  | AI Summarizer | coming |
| 11  | PDF Reader | coming |
| 12  | RSS Reader | coming |
| 13  | Read Later | coming |
| 14  | Chat With Knowledge Base | coming |
| 15  | Startup News Digest | coming |
| 16  | AI Trend Finder | coming |
| 17  | Competitor Watch | coming |
| 18  | Pricing Research | coming |
| 19  | Market Signals | coming |
| 20  | Founder Brief | coming |
| 21  | Opportunity Scanner | coming |
| 22  | Task Manager | coming |
| 23  | Idea Inbox | coming |
| 24  | Decision Journal | coming |
| 25  | Goal Tracker | coming |
| 26  | Habit Tracker | coming |
| 27  | Launch Tracker | coming |
| 28  | Investor Notes | coming |
| 29  | Founder Dashboard | coming |
| 30  | AI Chief of Staff | coming |

## Project Structure

```
founder-os/
├── main.js                      # Electron main process
├── preload.js                   # Context bridge
├── package.json
├── backend/
│   ├── main.py                  # FastAPI app entry
│   ├── database.py              # SQLite setup
│   ├── requirements.txt
│   └── routers/
│       └── focus_timer.py       # Day 01 routes
└── renderer/
    └── focus-timer/             # Day 01 UI
        ├── index.html
        ├── style.css
        └── app.js
```

## Adding a New App (Daily Workflow)

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Data

All data stored locally at `~/.founder-os/data.db`. No data leaves your machine.
