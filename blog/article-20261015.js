(() => {

  const homeHeader = document.querySelector('.home-header');
  const homeBurger = document.querySelector('.home-burger');
  const updateHeader = () => {
    if (!homeHeader) return;
    homeHeader.classList.toggle('scrolled', window.scrollY > 12 || homeHeader.classList.contains('open'));
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (homeBurger && homeHeader) {
    homeBurger.addEventListener('click', () => {
      homeHeader.classList.toggle('open');
      updateHeader();
    });
  }

  document.querySelectorAll('.home-mobile-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!homeHeader) return;
      homeHeader.classList.remove('open');
      updateHeader();
    });
  });
  const progress = document.querySelector('.reading-progress');
  const tocLinks = [...document.querySelectorAll('.toc-link')];
  const sections = tocLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const updateProgress = () => {
    if (!progress) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, value))}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        tocLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === id));
      });
    }, { rootMargin: '-34% 0px -58% 0px', threshold: 0.01 });
    sections.forEach((section) => observer.observe(section));
  }

  document.querySelectorAll('.copy-link').forEach((button) => {
    button.addEventListener('click', async () => {
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(window.location.href);
        button.textContent = 'Link copied';
      } catch (error) {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
        button.textContent = 'Link copied';
      }
      setTimeout(() => { button.textContent = original; }, 1600);
    });
  });
})();

/* RUM: CWV beacon (LCP/CLS/INP) to same-origin /cdn-cgi/rum (hook in Worker later) */
(function () {
  try {
    if (!('PerformanceObserver' in window)) return;
    var m = { lcp: 0, cls: 0, inp: 0, u: location.pathname };
    new PerformanceObserver(function (l) { var e = l.getEntries(); if (e.length) m.lcp = Math.round(e[e.length - 1].startTime); }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { if (!e.hadRecentInput) m.cls += e.value; }); }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { m.inp = Math.max(m.inp, Math.round(e.duration)); }); }).observe({ type: 'event', buffered: true });
    window.__cwv = m;
    addEventListener('pagehide', function () {
      m.cls = Math.round(m.cls * 1000) / 1000;
      try { if (navigator.sendBeacon) navigator.sendBeacon('/cdn-cgi/rum', JSON.stringify(m)); } catch (e) {}
    });
  } catch (e) {}
})();

/* DISCOs dropdown for sub-page headers (desktop hover + click/touch fallback) */
(() => {
  const dd = document.querySelector('.bb-disco-dropdown');
  if (!dd) return;
  const btn = dd.querySelector('button');
  const list = btn ? btn.nextElementSibling : null;
  if (!btn || !list) return;
  let closeTimer = null;
  if (!document.getElementById('bb-dd-anim')) {
    const st = document.createElement('style');
    st.id = 'bb-dd-anim';
    st.textContent = '.bb-disco-dropdown>button{font-family:inherit;font-size:14px;font-weight:600;line-height:1;transition:color .2s ease,background-color .2s ease}.bb-disco-dropdown>button:hover{color:#047857 !important;background:#ecfdf5 !important}.bb-disco-dropdown>div{opacity:0;transform:translateY(-8px) scale(.985);transform-origin:top right;transition:opacity .18s ease,transform .2s cubic-bezier(.2,.8,.25,1);pointer-events:none}.bb-disco-dropdown>div.bb-dd-open{opacity:1;transform:none;pointer-events:auto}@media (prefers-reduced-motion:reduce){.bb-disco-dropdown>div{transition:none}}';
    document.head.appendChild(st);
  }
  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      list.style.display = 'grid';
      requestAnimationFrame(() => requestAnimationFrame(() => { if (btn.getAttribute('aria-expanded') === 'true') list.classList.add('bb-dd-open'); }));
    } else {
      list.classList.remove('bb-dd-open');
      closeTimer = setTimeout(() => { if (!list.classList.contains('bb-dd-open')) list.style.display = 'none'; }, 200);
    }
  };
  setOpen(false);
  btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', (e) => { if (!dd.contains(e.target)) setOpen(false); });
  list.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let t = null;
    dd.addEventListener('mouseenter', () => { if (t) { clearTimeout(t); t = null; } setOpen(true); });
    dd.addEventListener('mouseleave', () => { t = setTimeout(() => setOpen(false), 250); });
  }
})();
