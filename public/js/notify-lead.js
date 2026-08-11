// Fire a fire-and-forget SMS notification to the business owner whenever a
// quote form is submitted, via the Answered247 relay endpoint (which owns the
// Twilio credentials). Silent on any failure — must never block the primary
// form submit path.
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
      fetch(NOTIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: page,
          url: window.location.href,
          fields: fields,
        }),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  };
})();
