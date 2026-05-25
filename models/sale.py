class Sale:
    def __init__(self, id, user_id, customer_type, total, status, created_at):
        self.id = id
        self.user_id = user_id
        self.customer_type = customer_type
        self.total = total
        self.status = status
        self.created_at = created_at

    def is_completed(self):
        return self.status == 'completed'
