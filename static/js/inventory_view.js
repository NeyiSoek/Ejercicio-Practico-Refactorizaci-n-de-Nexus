var InventoryView = {
  init: function() {
    API.get('/api/inventory', function(err, rows) {
      if (err) return;
      InventoryView.render(rows);
    });
  },
  render: function(rows) {
    var tbody = document.getElementById('invBody');
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      html += '<tr><td>' + (r.sku || '') + '</td>' +
              '<td>' + (r.name || '') + '</td>' +
              '<td>' + (r.warehouse || '') + '</td>' +
              '<td>' + (r.quantity == null ? 0 : r.quantity) + '</td></tr>';
    }
    tbody.innerHTML = html;
    var input = document.getElementById('filter');
    input.addEventListener('keyup', function(ev) {
      var q = ev.target.value.toLowerCase();
      var trs = document.querySelectorAll('#invBody tr');
      for (var j = 0; j < trs.length; j++) {
        var name = trs[j].cells[1].innerText.toLowerCase();
        trs[j].style.display = name.indexOf(q) >= 0 ? '' : 'none';
      }
    });
  }
};
