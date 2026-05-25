import db

class BaseRepository:
    table = None

    def find_by_id(self, id):
        rows = db.query("SELECT * FROM " + self.table + " WHERE id = ?", (id,))
        return rows[0] if rows else None

    def list_all(self):
        return db.query("SELECT * FROM " + self.table)

    def delete(self, id):
        db.execute("DELETE FROM " + self.table + " WHERE id = ?", (id,))
