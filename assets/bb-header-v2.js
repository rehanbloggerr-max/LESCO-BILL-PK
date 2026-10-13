/* Site header (app design) for the blog pages.
   Self-contained: scroll state, mobile menu, DISCOs dropdown.
   Mirrors initHeader()/initHeaderDropdown() from assets/bb-static-app-v1.js. */
(function () {
  'use strict';
  var d = document;
  var wrap = d.getElementById('bb-site-header');
  var header = wrap ? (wrap.tagName === 'HEADER' ? wrap : wrap.querySelector('header')) : null;
  if (!header) return;

  var SCROLLED = 'border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl';
  var burger = header.querySelector('button[aria-label="Toggle menu"]');
  var root = wrap || header;
  var panel = d.getElementById('bb-mobile-panel');
  var menuOpen = false;

  function addCls(el, list) { if (el) list.split(' ').forEach(function (c) { if (c) el.classList.add(c); }); }
  function rmCls(el, list) { if (el) list.split(' ').forEach(function (c) { if (c) el.classList.remove(c); }); }

  function apply() {
    if (window.scrollY > 12 || menuOpen) { addCls(header, SCROLLED); rmCls(header, 'bg-transparent'); }
    else { rmCls(header, SCROLLED); addCls(header, 'bg-transparent'); }
  }

  function setMenu(open) {
    if (!panel || !burger) return;
    menuOpen = !!open;
    panel.hidden = !menuOpen;
    burger.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
    var icons = burger.querySelectorAll('svg');
    if (icons[0]) icons[0].classList.toggle('hidden', menuOpen);
    if (icons[1]) icons[1].classList.toggle('hidden', !menuOpen);
    apply();
  }

  if (burger) burger.addEventListener('click', function (e) { e.preventDefault(); setMenu(!menuOpen); });
  if (panel) panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  window.addEventListener('scroll', apply, { passive: true });
  apply();
})();
