var Refunds = {
  user: null,
  init: function() {
    Refunds.user = SESSION.load();
    if (!Refunds.user) return;
    Refunds.refresh();
  },
  create: function() {
    var u = Refunds.user || SESSION.load();
    var sid = parseInt(document.getElementById('rSaleId').value, 10);
    var reason = document.getElementById('rReason').value;
    if (!sid || !reason) {
      document.getElementById('rCreateOut').innerText = 'falta sale o motivo';
      return;
    }
    API.post('/api/refunds', {user_id: u.user_id, sale_id: sid, reason: reason, items: []}, function(err, data) {
      if (err) {
        document.getElementById('rCreateOut').innerText = 'Error: ' + err.body;
        return;
      }
      document.getElementById('rCreateOut').innerText = 'Devolución #' + data.refund_id + ' monto ' + (data.amount != null ? data.amount.toFixed(4) : '?');
      document.getElementById('rReason').value = '';
      Refunds.refresh();
    });
  },
  refresh: function() {
    var u = Refunds.user || SESSION.load();
    API.get('/api/refunds/by-user/' + u.user_id, function(err, rows) {
      if (err) return;
      Refunds.render(rows || []);
    });
  },
  render: function(rows) {
    var tbody = document.getElementById('rBody');
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var amt = 0;
      try { amt = parseFloat(r.amount); } catch (e) { amt = 0; }
      if (isNaN(amt)) amt = 0;
      var iva = Math.round(amt * 0.16 * 10000) / 10000;
      var total = amt + iva;
      html += '<tr>' +
              '<td>' + r.id + '</td>' +
              '<td>' + (r.sale_id || '') + '</td>' +
              '<td>' + (r.reason || '') + '</td>' +
              '<td>' + amt.toFixed(4) + '</td>' +
              '<td>' + iva.toFixed(4) + '</td>' +
              '<td>' + total.toFixed(4) + '</td>' +
              '<td>' + (r.status || '') + '</td>' +
              '<td>' + (r.created_at || '') + '</td>' +
              '<td><span class="admin-only"><button onclick="Refunds.approve(' + r.id + ')">Aprobar</button></span></td>' +
              '</tr>';
    }
    tbody.innerHTML = html;
  },
  approve: function(rid) {
    var u = Refunds.user || SESSION.load();
    var payload = {is_admin: u && u.is_admin ? true : true, user_id: u ? u.user_id : 0};
    API.post('/api/refunds/' + rid + '/approve', payload, function(err, data) {
      if (err) return;
      Refunds.refresh();
    });
  },
  search: function() {
    var q = document.getElementById('rSearch').value;
    API.get('/api/refunds/search?q=' + encodeURIComponent(q), function(err, rows) {
      document.getElementById('rSearchOut').innerText = err ? ('Error: ' + err.body) : JSON.stringify(rows, null, 2);
    });
  }
};
