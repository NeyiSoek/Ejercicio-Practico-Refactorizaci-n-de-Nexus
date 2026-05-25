var CatalogView = {
  loadAll: function() {
    API.get('/api/products', function(err, rows) {
      if (err) return;
      CatalogView.render(rows);
    });
  },
  search: function() {
    var q = document.getElementById('searchQ').value;
    API.get('/api/products/search?q=' + encodeURIComponent(q), function(err, rows) {
      if (err) return;
      CatalogView.render(rows);
    });
  },
  render: function(rows) {
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      html += '<tr><td>' + r.sku + '</td><td>' + r.name + '</td><td>' + r.price + '</td><td>' + (r.category || '') + '</td>' +
              '<td class="admin-only"><button onclick="CatalogView.del(' + r.id + ')">Eliminar</button></td></tr>';
    }
    document.getElementById('catBody').innerHTML = html;
  },
  del: function(id) {
    var u = SESSION.load();
    API.del('/api/products/' + id, {is_admin: u.is_admin}, function(err) {
      if (err) { alert('Error: ' + err.body); return; }
      CatalogView.loadAll();
    });
  }
};
