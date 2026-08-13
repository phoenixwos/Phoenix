/* Phoenix usage tracking — anonymous.
 *
 * Add to any tool page, right before </body>:
 *   <script src="phx-track.js"></script>
 *
 * Logs a page view automatically. To log something more specific:
 *   PhxTrack.action('redeemed a code');
 *
 * No names, no Governor IDs, no account info — just a random per-browser id so
 * repeat visits from one person don't look like many people.
 */
(function () {
  var SUPA_URL = 'https://vghutrfcrqgelvgdeesl.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnaHV0cmZjcnFnZWx2Z2RlZXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDQ4ODksImV4cCI6MjA5Nzc4MDg4OX0.uarvB0sTDPqS1AysfvDRJahRYRLiJaBO2kVIiyGaDAE';

  function visitorId() {
    try {
      var v = localStorage.getItem('phx_visitor');
      if (!v) {
        v = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('phx_visitor', v);
      }
      return v;
    } catch (e) {
      return 'anon';
    }
  }

  function currentTool() {
    var p = location.pathname.split('/').pop() || 'index.html';
    return p;
  }

  function currentState() {
    try {
      var s = new URLSearchParams(location.search).get('s');
      return s || localStorage.getItem('phx_state') || '';
    } catch (e) {
      return '';
    }
  }

  function send(event, detail) {
    var body = JSON.stringify({
      event: event,
      tool: currentTool(),
      detail: detail || '',
      state: currentState(),
      visitor: visitorId(),
    });
    try {
      fetch(SUPA_URL + '/rest/v1/phx_events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPA_KEY,
          Authorization: 'Bearer ' + SUPA_KEY,
          Prefer: 'return=minimal',
        },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (e) { /* tracking must never break a page */ }
  }

  window.PhxTrack = {
    action: function (detail) { send('action', detail); },
  };

  // one view per page load
  send('view', '');
})();
