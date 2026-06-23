# Daily Workflow

Each day adds one app. Takes 4-8 hours. Same pattern every time.

## Step 1 - Add backend router

Create `backend/routers/day_NN_name.py`:

```python
from fastapi import APIRouter
from ..database import get_db

router = APIRouter(prefix="/name", tags=["day-NN"])

@router.get("/example")
def example():
    return {"hello": "world"}
```

Register it in `backend/main.py`:

```python
from .routers.day_NN_name import router as name_router
app.include_router(name_router)
```

## Step 2 - Add DB table

Add `CREATE TABLE IF NOT EXISTS` in `backend/database.py` inside `init_db()`.

```python
conn.execute("""
    CREATE TABLE IF NOT EXISTS your_table (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL
    )
""")
```

## Step 3 - Build the UI

Create `renderer/your-app/`:

```
renderer/
└── your-app/
    ├── index.html
    ├── style.css
    └── app.js
```

Copy `renderer/focus-timer/` as a starting template. The CSS variables
and layout stay the same across all apps for visual consistency.

API base URL is always `http://127.0.0.1:8765`.

## Step 4 - Wire Electron

Update `main.js` to load the new app:

```javascript
// swap this line in createWindow()
mainWindow.loadFile(path.join(__dirname, 'renderer', 'your-app', 'index.html'));
```

Or add a sidebar/nav in a future iteration so all apps are accessible at once.

## Step 5 - Update README

Mark the day as `done` in the apps table.

## Step 6 - Ship content

```
Day N/30 of building FounderOS in public.

Shipped: [App Name]

[3 bullet points of what it does]

Built in X hours.

Tomorrow: [Next App]
```

## Cheatsheet

| What | Where |
|------|-------|
| Backend API | `backend/routers/day_NN_*.py` |
| DB tables | `backend/database.py` `init_db()` |
| Frontend | `renderer/app-name/` |
| Data file | `~/.founder-os/data.db` |
| API port | `8765` |
| Run app | `npm start` |
| Inspect DB | `sqlite3 ~/.founder-os/data.db` |
