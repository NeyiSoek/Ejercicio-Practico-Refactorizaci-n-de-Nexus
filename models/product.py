class Product:
    def __init__(self, id, sku, name, price, category, supplier_id, deleted_at=None):
        self.id = id
        self.sku = sku
        self.name = name
        self.price = price
        self.category = category
        self.supplier_id = supplier_id
        self.deleted_at = deleted_at

    def is_active(self):
        return self.deleted_at is None

    def to_dict(self):
        return {
            "id": self.id, "sku": self.sku, "name": self.name,
            "price": self.price, "category": self.category,
            "supplier_id": self.supplier_id, "deleted_at": self.deleted_at
        }
