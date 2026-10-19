/* Back-to-top button — external file on purpose.
   The site's _headers sends a Content Security Policy with
   `script-src 'self' '<sha256>'`, so any NEW inline script is blocked unless its
   hash is added to the policy. Loading from /assets/ satisfies `'self'`
   with no CSP change. */
(function () {
  var b = document.querySelector('.bb-totop');
  if (!b) return;
  var shown = false;

  function upd() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var s = y > 420;
    if (s !== shown) {
      shown = s;
      b.classList.toggle('show', s);
    }
  }

  b.addEventListener('click', function () {
    var red = false;
    try {
      red = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    } catch (e) {}
    try {
      window.scrollTo({ top: 0, behavior: red ? 'auto' : 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    b.blur();
  });

  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd, { passive: true });
  upd();
})();
