var Exports = {
  user: null,
  init: function() {
    Exports.user = SESSION.load();
  },
  load: function() {
    var y = document.getElementById('eYear').value;
    var a = document.getElementById('eDimA').value;
    var b = document.getElementById('eDimB').value;
    API.get('/api/exports/pivot?year=' + y + '&a=' + a + '&b=' + b, function(err, rows) {
      if (err) {
        document.getElementById('pivotMeta').innerText = 'Error: ' + err.body;
        return;
      }
      Exports.render(rows || []);
    });
  },
  render: function(rows) {
    var tbody = document.getElementById('pivotBody');
    var html = '';
    var subtotal = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var gross = r.gross == null ? 0 : r.gross;
      subtotal += gross;
      html += '<tr>' +
              '<td class="pivotCell" data-row="' + i + '">' + (r.dim_a == null ? '' : r.dim_a) + '</td>' +
              '<td class="pivotCell" data-row="' + i + '">' + (r.dim_b == null ? '' : r.dim_b) + '</td>' +
              '<td>' + (r.n_sales == null ? 0 : r.n_sales) + '</td>' +
              '<td>' + (gross || 0).toFixed(4) + '</td>' +
              '<td>' + (r.effective == null ? 0 : r.effective).toFixed(4) + '</td>' +
              '<td>' + (r.after_volume == null ? 0 : r.after_volume).toFixed(4) + '</td>' +
              '</tr>';
    }
    tbody.innerHTML = html;
    document.getElementById('pivotMeta').innerText = 'Total gross: ' + subtotal.toFixed(4) + ' | filas: ' + rows.length;

    var cells = document.querySelectorAll('.pivotCell');
    for (var k = 0; k < cells.length; k++) {
      cells[k].addEventListener('click', Exports._cellHandler);
    }
  },
  _cellHandler: function(ev) {
    var t = ev.target;
    var idx = t.getAttribute('data-row');
    var prev = t.style.background;
    t.style.background = prev === 'yellow' ? '' : 'yellow';
    if (window.console) console.log('cell click row=' + idx);
  },
  totals: function() {
    var y = document.getElementById('tYear').value;
    var ct = document.getElementById('tCt').value;
    var url = '/api/exports/totals?year=' + encodeURIComponent(y);
    if (ct) url += '&customer_type=' + encodeURIComponent(ct);
    API.get(url, function(err, data) {
      document.getElementById('totalsOut').innerText = err ? ('Error: ' + err.body) : JSON.stringify(data, null, 2);
    });
  },
  downloadCsv: function() {
    var u = Exports.user || SESSION.load();
    var f = document.getElementById('eFilter').value || '1=1';
    var url = '/api/exports/csv?filter=' + encodeURIComponent(f) + '&is_admin=' + (u && u.is_admin ? 'true' : 'false');
    API.get(url, function(err, data) {
      document.getElementById('csvOut').innerText = err ? ('Error: ' + err.body) : (data.csv || '');
    });
  }
};
