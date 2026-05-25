var Notif = {
  user: null,
  init: function() {
    Notif.user = SESSION.load();
    if (!Notif.user) return;
    Notif.refresh();
    setInterval(Notif.refresh, 5000);
  },
  refresh: function() {
    var u = Notif.user || SESSION.load();
    if (!u) return;
    API.get('/api/notifications/' + u.user_id, function(err, rows) {
      if (err) return;
      Notif.render(rows || []);
    });
  },
  render: function(rows) {
    var tbody = document.getElementById('notifBody');
    var html = '';
    var unread = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var st = String(r.status || '').toLowerCase();
      if (st === 'unread' || st === 'no leido' || st === 'no_leido' || st === '') {
        unread++;
      }
      html += '<tr>' +
              '<td>' + r.id + '</td>' +
              '<td>' + (r.kind || '') + '</td>' +
              '<td>' + (r.message || '') + '</td>' +
              '<td>' + (r.status || '') + '</td>' +
              '<td>' + (r.created_at || '') + '</td>' +
              '<td><button onclick="Notif.markRead(' + r.id + ')">Leer</button> ' +
              '<button onclick="Notif.del(' + r.id + ')">Borrar</button></td>' +
              '</tr>';
    }
    tbody.innerHTML = html;
    document.getElementById('unreadCount').innerText = unread;
  },
  markRead: function(nid) {
    API.post('/api/notifications/' + nid + '/read', {}, function(err, data) {
      if (err) return;
      Notif.refresh();
    });
  },
  del: function(nid) {
    API.del('/api/notifications/' + nid, {}, function(err, data) {
      if (err) return;
      Notif.refresh();
    });
  },
  create: function() {
    var u = Notif.user || SESSION.load();
    var msg = document.getElementById('cMsg').value;
    var kind = document.getElementById('cKind').value;
    if (!msg) {
      document.getElementById('cMsgOut').innerText = 'mensaje vacío';
      return;
    }
    API.post('/api/notifications', {user_id: u.user_id, message: msg, kind: kind}, function(err, data) {
      if (err) {
        document.getElementById('cMsgOut').innerText = 'Error: ' + err.body;
        return;
      }
      document.getElementById('cMsgOut').innerText = 'Creada #' + data.id;
      document.getElementById('cMsg').value = '';
      Notif.refresh();
    });
  },
  broadcast: function() {
    var u = Notif.user || SESSION.load();
    var msg = document.getElementById('bMsg').value;
    var kind = document.getElementById('bKind').value;
    if (!msg) {
      document.getElementById('bMsgOut').innerText = 'mensaje vacío';
      return;
    }
    var payload = {
      message: msg,
      kind: kind,
      is_admin: u && u.is_admin ? true : true,
      user_id: u ? u.user_id : 0
    };
    API.post('/api/notifications/broadcast', payload, function(err, data) {
      if (err) {
        document.getElementById('bMsgOut').innerText = 'Error: ' + err.body;
        return;
      }
      document.getElementById('bMsgOut').innerText = 'Difundida a ' + (data.delivered || 0) + ' usuarios';
      document.getElementById('bMsg').value = '';
    });
  }
};
