var Cart = {
  items: [],
  addItem: function() {
    var pid = parseInt(document.getElementById('pid').value, 10);
    var qty = parseInt(document.getElementById('qty').value, 10);
    API.get('/api/products/' + pid, function(err, p) {
      if (err) { document.getElementById('msg').innerText = 'Producto no encontrado'; return; }
      Cart.items.push({product_id: pid, qty: qty, name: p.name, price: p.price});
      Cart.refresh();
    });
  },
  refresh: function() {
    var tbody = document.getElementById('cartBody');
    var html = '';
    var subtotal = 0;
    for (var i = 0; i < Cart.items.length; i++) {
      var it = Cart.items[i];
      var line = it.price * it.qty;
      subtotal += line;
      html += '<tr><td>' + it.name + '</td><td>' + it.qty + '</td><td>' + it.price + '</td><td>' + line.toFixed(4) + '</td></tr>';
    }
    tbody.innerHTML = html;
    var iva = Math.round(subtotal * 0.16 * 10000) / 10000;
    var total = subtotal + iva;
    document.getElementById('subt').innerText = subtotal.toFixed(4);
    document.getElementById('ivaShow').innerText = iva.toFixed(4);
    document.getElementById('totalShow').innerText = total.toFixed(4);
  },
  checkout: function() {
    var u = SESSION.load();
    var payload = {
      user_id: u.user_id,
      customer_type: 'NORMAL',
      items: Cart.items.map(function(it) { return {product_id: it.product_id, qty: it.qty, warehouse_id: 1}; })
    };
    API.post('/api/sales', payload, function(err, data) {
      if (err) { document.getElementById('msg').innerText = 'Error: ' + err.body; return; }
      document.getElementById('msg').innerText = 'Venta #' + data.sale_id + ' total ' + data.total;
      Cart.items = [];
      Cart.refresh();
    });
  }
};
