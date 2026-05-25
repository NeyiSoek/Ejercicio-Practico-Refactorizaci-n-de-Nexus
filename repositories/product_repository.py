from repositories.base_repository import BaseRepository

class ProductRepository(BaseRepository):
    table = "products"

    def find_active(self):
        import db
        return db.query("SELECT * FROM products WHERE deleted_at IS NULL")
