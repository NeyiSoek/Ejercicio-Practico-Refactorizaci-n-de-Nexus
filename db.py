import sqlite3
import os

DB_PATH = "data/legacy.db"
_conn = None

def get_conn():
    global _conn
    if _conn is None:
        first = not os.path.exists(DB_PATH)
        _conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        _conn.execute("PRAGMA foreign_keys = OFF")
        _conn.row_factory = sqlite3.Row
        if first:
            _init_schema_and_seed()
    return _conn

def _init_schema_and_seed():
    with open("seed_data.sql", "r", encoding="utf-8") as f:
        script = f.read()
    _conn.executescript(script)
    _conn.commit()

def query(sql, params=None):
    conn = get_conn()
    cur = conn.cursor()
    if params:
        cur.execute(sql, params)
    else:
        cur.execute(sql)
    return cur.fetchall()

def execute(sql, params=None):
    conn = get_conn()
    cur = conn.cursor()
    if params:
        cur.execute(sql, params)
    else:
        cur.execute(sql)
    conn.commit()
    return cur.lastrowid
