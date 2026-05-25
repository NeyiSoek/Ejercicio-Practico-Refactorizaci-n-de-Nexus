var Reports = {
  init: function() {
    Reports.refresh();
    Reports.loadMonthly();
    setInterval(Reports.refresh, 5000);
  },
  refresh: function() {
    var now = new Date();
    API.get('/api/reports/total?year=' + now.getFullYear() + '&month=' + (now.getMonth() + 1), function(err, data) {
      if (err) return;
      document.getElementById('totalSales').innerText = data.total;
      document.getElementById('lastUpd').innerText = now.toLocaleTimeString();
    });
  },
  loadMonthly: function() {
    var y = document.getElementById('repYear').value || 2025;
    var m = document.getElementById('repMonth').value || 1;
    API.get('/api/reports/monthly?year=' + y + '&month=' + m, function(err, rows) {
      var tbody = document.getElementById('monthlyBody');
      if (err) { tbody.innerHTML = ''; document.getElementById('monthlyMeta').innerText = 'Error al cargar'; return; }
      var html = '';
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        html += '<tr><td>' + r.id + '</td>' +
                '<td>' + (r.username || r.user_id) + '</td>' +
                '<td>' + (r.customer_type || '') + '</td>' +
                '<td>' + (r.product_name || '') + '</td>' +
                '<td>' + r.qty + '</td>' +
                '<td>' + r.unit_price + '</td>' +
                '<td>' + (r.effective_subtotal != null ? r.effective_subtotal.toFixed(2) : '') + '</td>' +
                '<td>' + (r.line_after_discount != null ? r.line_after_discount.toFixed(2) : '') + '</td>' +
                '<td>' + (r.created_at || '') + '</td></tr>';
      }
      tbody.innerHTML = html;
      document.getElementById('monthlyMeta').innerText = rows.length + ' registros';
    });
  },
  exportData: function() {
    var u = SESSION.load();
    var t = document.getElementById('repType').value;
    var f = document.getElementById('repFilter').value;
    API.get('/api/reports/export?type=' + t + '&filter=' + encodeURIComponent(f) + '&is_admin=' + (u.is_admin ? 'true' : 'false'),
      function(err, rows) {
        document.getElementById('exportOut').innerText = err ? ('Error: ' + err.body) : JSON.stringify(rows, null, 2);
      });
  }
};
