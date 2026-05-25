var SESSION = {
  load: function() {
    var raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  },
  save: function(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.currentUser = user;
    SESSION.applyAdminVisibility();
  },
  clear: function() {
    localStorage.removeItem('currentUser');
    window.currentUser = null;
    SESSION.applyAdminVisibility();
  },
  applyAdminVisibility: function() {
    var body = document.body;
    if (window.currentUser && window.currentUser.is_admin) {
      body.className = 'is-admin';
    } else {
      body.className = '';
    }
  },
  requireLogin: function() {
    var user = SESSION.load();
    if (!user) {
      window.location.href = '/static/login.html';
      return null;
    }
    window.currentUser = user;
    SESSION.applyAdminVisibility();
    return user;
  }
};
