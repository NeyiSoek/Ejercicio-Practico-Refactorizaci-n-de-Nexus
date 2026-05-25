var SalesHistory = {
  load: function(uid) {
    API.get('/api/sales/by-user/' + uid, function(err, rows) {
      if (err) return;
      var html = '';
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        html += '<tr><td>' + r.id + '</td><td>' + r.total + '</td><td>' + r.status + '</td>' +
                '<td>' + r.created_at + '</td>' +
                '<td><button onclick="SalesHistory.doReturn(' + r.id + ')">Devolver</button></td></tr>';
      }
      document.getElementById('histBody').innerHTML = html;
    });
  },
  doReturn: function(sid) {
    var qty = prompt('Cantidad a devolver del primer item:');
    if (!qty) return;
    API.post('/api/sales/' + sid + '/return', {items: [{product_id: 1, qty: parseInt(qty, 10), warehouse_id: 1}]},
      function(err, data) { alert(err ? 'Error' : 'Devolución OK'); });
  }
};
