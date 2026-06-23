import sqlite3
from pathlib import Path

DB_PATH = Path.home() / ".founder-os" / "data.db"


def get_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS focus_sessions (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            type         TEXT    NOT NULL,
            duration_min INTEGER NOT NULL,
            started_at   TEXT    NOT NULL,
            completed_at TEXT,
            completed    INTEGER NOT NULL DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()
