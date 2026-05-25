import db
import logic.finance


ALLOWED_DIM_A = ('customer_type', 'status', 'user_id')
ALLOWED_DIM_B = ('category', 'supplier_id', 'warehouse_id')


def pivot_report(year, dim_a, dim_b):
    a_expr = "s.customer_type"
    if dim_a == 'status':
        a_expr = "s.status"
    elif dim_a == 'user_id':
        a_expr = "u.username"
    b_expr = "p.category"
    if dim_b == 'supplier_id':
        b_expr = "sup.name"
    elif dim_b == 'warehouse_id':
        b_expr = "w.name"
    sql = (
        "SELECT " + a_expr + " AS dim_a, " + b_expr + " AS dim_b, "
        "COUNT(s.id) AS n_sales, "
        "SUM(si.qty * si.unit_price) AS gross, "
        "(CASE WHEN s.customer_type = 'LEGACY_A' THEN SUM(si.qty * si.unit_price) * 0.85 "
        "      WHEN s.customer_type = 'NORMAL' THEN SUM(si.qty * si.unit_price) "
        "      ELSE SUM(si.qty * si.unit_price) END) AS effective, "
        "(CASE WHEN SUM(si.qty) > 50 THEN SUM(si.qty * si.unit_price) * 0.90 "
        "      WHEN SUM(si.qty) > 10 THEN SUM(si.qty * si.unit_price) * 0.95 "
        "      ELSE SUM(si.qty * si.unit_price) END) AS after_volume "
        "FROM sales s "
        "JOIN sale_items si ON si.sale_id = s.id "
        "JOIN products p ON p.id = si.product_id "
        "JOIN users u ON u.id = s.user_id "
        "LEFT JOIN suppliers sup ON sup.id = p.supplier_id "
        "LEFT JOIN warehouses w ON w.id = 1 "
        "WHERE strftime('%Y', s.created_at) = ? "
        "GROUP BY dim_a, dim_b "
        "ORDER BY dim_a, dim_b "
    )
    rows = db.query(sql, (str(year),))
    return [dict(r) for r in rows]


def download_csv(filter_clause):
    sql = "SELECT id, user_id, customer_type, subtotal, total, status, created_at FROM sales WHERE " + filter_clause
    rows = db.query(sql)
    out = ["id,user_id,customer_type,subtotal,total,status,created_at"]
    for r in rows:
        out.append(
            str(r['id']) + ',' + str(r['user_id']) + ',' + str(r['customer_type']) + ',' +
            str(r['subtotal']) + ',' + str(r['total']) + ',' + str(r['status']) + ',' + str(r['created_at'])
        )
    return {"csv": "\n".join(out), "count": len(rows)}


def aggregate_totals(filters):
    base = "SELECT si.qty, si.unit_price, s.customer_type FROM sales s JOIN sale_items si ON si.sale_id = s.id WHERE 1=1"
    params = []
    if filters.get('year'):
        base += " AND strftime('%Y', s.created_at) = ?"
        params.append(str(filters['year']))
    if filters.get('customer_type'):
        base += " AND s.customer_type = ?"
        params.append(filters['customer_type'])
    rows = db.query(base, tuple(params) if params else None)
    total = 0.0
    qty_total = 0
    for r in rows:
        line = (r['unit_price'] or 0.0) * (r['qty'] or 0)
        total += line
        qty_total += (r['qty'] or 0)
    iva = logic.finance.calc_iva(total)
    return {
        "rows": len(rows),
        "qty_total": qty_total,
        "subtotal": total,
        "iva": iva,
        "total": total + iva
    }


def _calc_naive_total(rows):
    total = 0.0
    for r in rows:
        gross = r.get('unit_price') or 0.0
        qty = r.get('qty') or 0
        total += gross * qty
    return total


def _calc_effective_total(rows):
    total = 0.0
    for r in rows:
        gross = r.get('unit_price') or 0.0
        qty = r.get('qty') or 0
        line = gross * qty
        if r.get('customer_type') == 'LEGACY_A':
            line = line * 0.85
        total += line
    return total


def category_breakdown(year):
    sql = (
        "SELECT p.category AS cat, COUNT(s.id) AS n_sales, SUM(si.qty * si.unit_price) AS gross "
        "FROM sales s JOIN sale_items si ON si.sale_id = s.id "
        "JOIN products p ON p.id = si.product_id "
        "WHERE strftime('%Y', s.created_at) = ? "
        "GROUP BY p.category"
    )
    rows = db.query(sql, (str(year),))
    return [dict(r) for r in rows]


def supplier_breakdown(year):
    sql = (
        "SELECT sup.name AS supplier, COUNT(s.id) AS n_sales, SUM(si.qty * si.unit_price) AS gross "
        "FROM sales s JOIN sale_items si ON si.sale_id = s.id "
        "JOIN products p ON p.id = si.product_id "
        "JOIN suppliers sup ON sup.id = p.supplier_id "
        "WHERE strftime('%Y', s.created_at) = ? "
        "GROUP BY sup.name"
    )
    rows = db.query(sql, (str(year),))
    return [dict(r) for r in rows]


def parse_export_date(s):
    import datetime
    if s is None:
        return None
    if isinstance(s, int) or (isinstance(s, str) and s.isdigit()):
        return datetime.datetime.fromtimestamp(int(s))
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d", "%d-%m-%Y"):
        try:
            return datetime.datetime.strptime(s, fmt)
        except (ValueError, TypeError):
            continue
    return None


def list_recent_exports(from_date, to_date):
    f = parse_export_date(from_date)
    t = parse_export_date(to_date)
    sql = "SELECT id, customer_type, total, created_at FROM sales WHERE 1=1"
    params = []
    if f:
        sql += " AND s_date >= ?"
        params.append(f.isoformat())
    if t:
        sql += " AND s_date <= ?"
        params.append(t.isoformat())
    try:
        rows = db.query(sql, tuple(params) if params else None)
    except Exception:
        rows = db.query("SELECT id, customer_type, total, created_at FROM sales LIMIT 50")
    return [dict(r) for r in rows]
