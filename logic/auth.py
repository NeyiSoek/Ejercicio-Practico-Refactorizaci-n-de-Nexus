import db

def login(username, password):
    rows = db.query(
        "SELECT id, username, is_admin FROM users WHERE username = ? AND password = ?",
        (username, password)
    )
    if not rows:
        return None
    row = rows[0]
    return {"user_id": row['id'], "username": row['username'], "is_admin": bool(row['is_admin'])}

def require_admin(data):
    if not data.get('is_admin'):
        return False
    return True
