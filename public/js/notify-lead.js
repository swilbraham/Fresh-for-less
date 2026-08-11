// Fire a fire-and-forget SMS notification to the business owner whenever a
// quote form is submitted, via the Answered247 relay endpoint (which owns the
// Twilio credentials). Silent on any failure — must never block the primary
// form submit path.
//
// Uses navigator.sendBeacon() with a text/plain payload so the request is a
// "simple" CORS request (no OPTIONS preflight), survives page navigation and
// keeps working under Safari ITP, incognito modes, and stricter privacy
// settings that were blocking the previous fetch()+application/json approach.
(function () {
  var NOTIFY_URL = 'https://answered247.co.uk/api/notify-lead';

  window.notifyLead = function (page, formData) {
    try {
      var fields = {};
      if (formData && typeof formData.forEach === 'function') {
        formData.forEach(function (value, key) {
          if (typeof value === 'string') fields[key] = value;
        });
      }
      var payload = JSON.stringify({
        page: page,
        url: window.location.href,
        fields: fields,
      });
      var body = new Blob([payload], { type: 'text/plain;charset=UTF-8' });
      var sent = false;
      if (navigator.sendBeacon) {
        try { sent = navigator.sendBeacon(NOTIFY_URL, body); } catch (e) {}
      }
      if (!sent) {
        // Fallback: text/plain fetch is also a "simple" request, no preflight.
        fetch(NOTIFY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: payload,
          keepalive: true,
          mode: 'no-cors',
        }).catch(function () {});
      }
    } catch (e) {}
  };
})();
