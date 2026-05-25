var Purchases = {
  loadSuppliers: function() {
    API.get('/api/suppliers', function(err, rows) {
      if (err) return;
      var sel = document.getElementById('sup');
      var html = '';
      for (var i = 0; i < rows.length; i++) {
        html += '<option value="' + rows[i].id + '">' + rows[i].name + '</option>';
      }
      sel.innerHTML = html;
    });
  },
  submit: function() {
    var payload = {
      supplier_id: parseInt(document.getElementById('sup').value, 10),
      received_date: document.getElementById('date').value,
      items: [{
        product_id: parseInt(document.getElementById('prod').value, 10),
        qty: parseInt(document.getElementById('qty').value, 10),
        unit_cost: parseFloat(document.getElementById('cost').value),
        warehouse_id: 1
      }]
    };
    API.post('/api/purchases', payload, function(err, data) {
      if (err) { document.getElementById('msg').innerText = 'Error: ' + err.body; return; }
      document.getElementById('msg').innerText = 'Compra #' + data.purchase_id;
      Purchases.refreshList();
    });
  },
  refreshList: function() {
    API.get('/api/purchases', function(err, rows) {
      if (err) return;
      var html = '';
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        html += '<tr><td>' + r.id + '</td>' +
                '<td>' + (r.supplier_name || r.supplier_id) + '</td>' +
                '<td>' + r.total + '</td>' +
                '<td>' + (r.received_date || '') + '</td>' +
                '<td>' + (r.status || '') + '</td>' +
                '<td>' + (r.bank_ref || '') + '</td></tr>';
      }
      document.getElementById('purchBody').innerHTML = html;
    });
  }
};
