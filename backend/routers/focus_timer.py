from datetime import datetime, date
from fastapi import APIRouter
from pydantic import BaseModel

from ..database import get_db

router = APIRouter(prefix="/focus", tags=["focus-timer"])


class SessionIn(BaseModel):
    type: str          # focus | short_break | long_break
    duration_min: int
    started_at: str    # ISO string
    completed: bool = True


@router.post("/sessions")
def create_session(payload: SessionIn):
    completed_at = datetime.utcnow().isoformat() if payload.completed else None
    conn = get_db()
    cur = conn.execute(
        """INSERT INTO focus_sessions
           (type, duration_min, started_at, completed_at, completed)
           VALUES (?, ?, ?, ?, ?)""",
        (payload.type, payload.duration_min, payload.started_at,
         completed_at, int(payload.completed)),
    )
    conn.commit()
    row = conn.execute(
        "SELECT * FROM focus_sessions WHERE id = ?", (cur.lastrowid,)
    ).fetchone()
    conn.close()
    return dict(row)


@router.get("/sessions/today")
def get_today_sessions():
    today = date.today().isoformat()
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM focus_sessions WHERE started_at LIKE ? ORDER BY started_at DESC",
        (f"{today}%",),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.get("/stats/today")
def get_today_stats():
    today = date.today().isoformat()
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM focus_sessions WHERE started_at LIKE ? AND completed = 1",
        (f"{today}%",),
    ).fetchall()
    conn.close()

    sessions = [dict(r) for r in rows]
    focus = [s for s in sessions if s["type"] == "focus"]
    breaks = [s for s in sessions if "break" in s["type"]]

    return {
        "focus_sessions": len(focus),
        "total_focus_minutes": sum(s["duration_min"] for s in focus),
        "breaks": len(breaks),
    }
