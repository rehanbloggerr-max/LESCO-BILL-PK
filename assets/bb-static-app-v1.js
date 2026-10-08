/*! bb-static-app v1 (2026-10-08)
 *  Vanilla-JS replacement for the React bundle on the 13 app pages.
 *  Ports (1:1 behaviour) from index-ref-locator-v1.js:
 *    DISCO checker (dropdown, tabs, ring, segments, saved numbers, submit)
 *    Bill calculator engine + breakdown + ladder
 *    FAQ accordion, mobile menu, blog filters, header scroll state,
 *    hero network canvas, hero typewriter, live-activity feed.
 *  No dependencies. Loaded with defer.
 */
(function () {
  'use strict';

  var d = document;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function on(el, ev, fn, o) { if (el) el.addEventListener(ev, fn, o || false); }
  function addCls(el, list) { if (el) list.split(' ').forEach(function (c) { if (c) el.classList.add(c); }); }
  function rmCls(el, list) { if (el) list.split(' ').forEach(function (c) { if (c) el.classList.remove(c); }); }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function ready(fn) { if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn); else fn(); }

  /* ============================ data ============================ */

  var DISCOS = [
    { id: 'lesco',  short: 'LESCO',  name: 'Lahore Electric Supply Co.',      region: 'Lahore region',         cities: ['Lahore', 'Kasur', 'Sheikhupura', 'Nankana Sahib'],      color: '#2563eb', slug: 'lesco',  portal: 'pitc' },
    { id: 'iesco',  short: 'IESCO',  name: 'Islamabad Electric Supply Co.',   region: 'Capital region',        cities: ['Islamabad', 'Rawalpindi', 'Attock', 'Jhelum', 'Chakwal'], color: '#0284c7', slug: 'iesco',  portal: 'pitc' },
    { id: 'gepco',  short: 'GEPCO',  name: 'Gujranwala Electric Power Co.',  region: 'Gujranwala region',     cities: ['Gujranwala', 'Sialkot', 'Gujrat', 'Narowal'],           color: '#7c3aed', slug: 'gepco',  portal: 'pitc' },
    { id: 'fesco',  short: 'FESCO',  name: 'Faisalabad Electric Supply Co.',  region: 'Faisalabad region',     cities: ['Faisalabad', 'Sargodha', 'Jhang', 'Chiniot'],           color: '#ea580c', slug: 'fesco',  portal: 'pitc' },
    { id: 'mepco',  short: 'MEPCO',  name: 'Multan Electric Power Co.',       region: 'South Punjab',          cities: ['Multan', 'Bahawalpur', 'DG Khan', 'Sahiwal'],           color: '#16a34a', slug: 'mepco',  portal: 'pitc' },
    { id: 'pesco',  short: 'PESCO',  name: 'Peshawar Electric Supply Co.',    region: 'Khyber Pakhtunkhwa',    cities: ['Peshawar', 'Mardan', 'Swat', 'Kohat'],                  color: '#e11d48', slug: 'pesco',  portal: 'pitc' },
    { id: 'hesco',  short: 'HESCO',  name: 'Hyderabad Electric Supply Co.',   region: 'Lower Sindh',           cities: ['Hyderabad', 'Mirpurkhas', 'Thatta', 'Badin'],           color: '#d97706', slug: 'hesco',  portal: 'pitc' },
    { id: 'sepco',  short: 'SEPCO',  name: 'Sukkur Electric Power Co.',       region: 'Upper Sindh',           cities: ['Sukkur', 'Larkana', 'Khairpur', 'Jacobabad'],           color: '#0d9488', slug: 'sepco',  portal: 'pitc' },
    { id: 'qesco',  short: 'QESCO',  name: 'Quetta Electric Supply Co.',      region: 'Balochistan',           cities: ['Quetta', 'Khuzdar', 'Zhob', 'Turbat'],                  color: '#c026d3', slug: 'qesco',  portal: 'pitc' },
    { id: 'tesco',  short: 'TESCO',  name: 'Tribal Areas Electric Supply Co.',region: 'Merged districts',      cities: ['Khyber', 'Bajaur', 'Mohmand', 'Kurram'],                color: '#65a30d', slug: 'tesco',  portal: 'pitc' },
    { id: 'hazeco', short: 'HAZECO', name: 'Hazara Electric Supply Co.',      region: 'Hazara division',       cities: ['Abbottabad', 'Mansehra', 'Haripur', 'Battagram'],       color: '#0891b2', slug: 'hazeco', portal: 'pitc' },
    { id: 'ke',     short: 'K-Electric', name: 'K-Electric Limited',          region: 'Karachi',               cities: ['Karachi', 'Hub', 'Gharo', 'Dhabeji'],                   color: '#dc2626', slug: 'ke',     portal: 'ke' }
  ];
  var KE_BILLS_URL = 'https://www.ke.com.pk/customer-services/view-and-pay-your-bill/';
  var LESCO_MENU_URL = 'https://bill.lesco.gov.pk:36269/Modules/CustomerBillN/CustomerMenu.asp#ContentPane';
  var SAVED_KEY = 'bijleebill:saved';

  function discoById(id) { for (var i = 0; i < DISCOS.length; i++) if (DISCOS[i].id === id) return DISCOS[i]; return null; }
  /* field config — port of Np() */
  function fieldCfg(disco, mode) {
    if (disco && disco.id === 'ke') return { mode: 'ref', label: 'Account number (13 digits)', short: 'Account no.', min: 13, max: 13, groups: [13], placeholder: '0000000000000', segLabels: ['Account number'] };
    if (mode === 'cid') {
      var isLesco = disco && disco.id === 'lesco';
      return { mode: 'cid', label: isLesco ? 'Customer ID (6\u201310 digits)' : 'Customer ID (10 digits)', short: 'Customer ID', min: isLesco ? 6 : 10, max: 10, groups: [10], placeholder: '0123456789', segLabels: ['Customer ID'] };
    }
    return { mode: 'ref', label: 'Reference number (14 digits)', short: 'Reference no.', min: 14, max: 14, groups: [2, 5, 7], placeholder: '03123456789012', segLabels: ['Batch', 'Sub-division', 'Consumer no.'] };
  }
  function targetUrl(disco, mode, value) {  /* port of u0() */
    if (!disco) return null;
    if (disco.portal === 'ke') return KE_BILLS_URL;
    var base = 'https://bill.pitc.com.pk/' + disco.slug + 'bill';
    return mode === 'ref' ? base + '/general?refno=' + encodeURIComponent(value) : base;
  }
  function maskTail(v) { return v.length > 4 ? '\u2022\u2022\u2022 ' + v.slice(-4) : v; }   /* port of c0() */
  function fmt2(n) { return n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmt0(n) { return Math.round(n).toLocaleString('en-PK'); }
  function prec6(n) { return (+n).toPrecision(6); }
  function hexToRgb(hex) {
    var m = String(hex || '').replace('#', '');
    if (m.length === 3) m = m.split('').map(function (c) { return c + c; }).join('');
    var v = parseInt(m, 16);
    return [v >> 16 & 255, v >> 8 & 255, v & 255];
  }

  /* ============================ 1. checker ============================ */

  function initChecker() {
    var card = $('#checker-card');
    if (!card) return;
    var form = $('form', card);
    if (!form) return;
    var btn = $('#disco-select');
    var btnWrap = btn ? btn.parentElement : null;
    var monoSlot = btn ? $('span.grid', btn) : null;
    var nameEl = btn ? $('span.min-w-0 > span:nth-child(1)', btn) : null;
    var subEl = btn ? $('span.min-w-0 > span:nth-child(2)', btn) : null;
    var chev = btn ? $('svg:last-child', btn) : null;
    var panel = $('#bb-disco-panel');
    var searchInp = panel ? $('input', panel) : null;
    var list = panel ? $('[role="listbox"]', panel) : null;
    var input = $('#bill-input');
    if (!btn || !input) return;
    var inputWrap = input.parentElement;
    var ring = $('circle[stroke-dashoffset]', inputWrap);
    var count = $('span.font-mono', inputWrap);
    var segRow = inputWrap.nextElementSibling;
    var label = $('label[for="bill-input"]', form);
    var tabsWrap = $('.grid.grid-cols-2', form);
    var tabs = tabsWrap ? $$('button', tabsWrap) : [];
    var slider = tabsWrap ? $('span.absolute', tabsWrap) : null;
    var saveChk = $('input[type="checkbox"]', form);
    var submitBtn = $('button[type="submit"]', form);
    var fieldBox = inputWrap.parentElement;            /* div holding label row + input + segments */

    /* initial state from the page (baked by the builder) */
    var st = {
      discoId: form.getAttribute('data-disco') || null,
      mode: 'ref',
      value: '',
      saved: loadSaved(),
      saveOn: saveChk ? !!saveChk.checked : true,
      error: ''
    };
    if (st.discoId === 'ke') st.mode = 'ref';

    function loadSaved() { try { var v = localStorage.getItem(SAVED_KEY); return v ? JSON.parse(v) || [] : []; } catch (e) { return []; } }
    function persistSaved() { try { localStorage.setItem(SAVED_KEY, JSON.stringify(st.saved)); } catch (e) {} }
    function currentDisco() { return discoById(st.discoId); }
    function cfg() { return fieldCfg(currentDisco(), st.mode); }

    /* ---------- error + ring ---------- */
    var RING_LEN = 94.24777960769379;
    var ERR_CLS = 'mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600 animate-fade-up';
    var ERR_SVG = '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg>';

    function setError(msg) {
      st.error = msg || '';
      if (!msg) { if (fieldBox._err) { fieldBox._err.remove(); fieldBox._err = null; } return; }
      if (!fieldBox._err) {
        var p = d.createElement('p');
        p.className = ERR_CLS;
        p.innerHTML = ERR_SVG + ' <span></span>';
        fieldBox.appendChild(p);
        fieldBox._err = p;
        var shakeTarget = fieldBox.closest('.group\\/card') || card;
        addCls(shakeTarget, 'animate-shake');
        setTimeout(function () { rmCls(shakeTarget, 'animate-shake'); }, 460);
      }
      var span = fieldBox._err.querySelector('span');
      if (span) span.textContent = msg;
    }
    function clearError() { if (st.error) setError(''); }

    function renderInputState() {
      var c = cfg();
      var valid = !!currentDisco() && st.value.length >= c.min && st.value.length <= c.max;
      rmCls(inputWrap, 'border-slate-200 border-emerald-500 border-rose-400 ring-4 ring-emerald-500/15 ring-rose-400/15 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15');
      if (st.error) { addCls(inputWrap, 'border-rose-400 ring-4 ring-rose-400/15'); }
      else if (valid) { addCls(inputWrap, 'border-emerald-500 ring-4 ring-emerald-500/15'); }
      else { addCls(inputWrap, 'border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15'); }
    }
    function renderRing() {
      var c = cfg();
      var prog = Math.min(1, st.value.length / c.max);
      if (ring) ring.setAttribute('stroke-dashoffset', String(RING_LEN * (1 - prog)));
      if (count) count.textContent = String(st.value.length);
    }
    var SEG_BOX = 'flex h-7 items-center justify-center rounded-lg border font-mono text-xs font-bold tracking-widest transition-all duration-300 ';
    var SEG_ON = 'border-emerald-300 bg-emerald-50 text-emerald-700';
    var SEG_OFF = 'border-dashed border-slate-200 text-slate-300';
    function renderSegments() {
      var c = cfg();
      if (!segRow) return;
      var groups = c.groups, parts = [], pos = 0;
      for (var i = 0; i < groups.length; i++) { parts.push(st.value.slice(pos, pos + groups[i])); pos += groups[i]; }
      segRow.innerHTML = parts.map(function (part, i) {
        var on = part.length > 0;
        var flex = groups[i];
        var txt = on ? part : new Array(Math.min(groups[i], 3) + 1).join('\u00b7');
        var lb = c.segLabels[i] || c.segLabels[0] || '';
        return '<div class="min-w-0" style="flex: ' + flex + ' 1 0%;">' +
               '<div class="' + SEG_BOX + (on ? SEG_ON : SEG_OFF) + '">' + txt + '</div>' +
               '<div class="mt-1 truncate text-center text-[10px] font-medium text-slate-400">' + lb + '</div></div>';
      }).join('');
    }
    function renderValue() {
      input.value = st.value;
      renderRing();
      renderSegments();
      renderInputState();
    }
    function renderFieldConfig() {
      var c = cfg();
      if (label) label.textContent = c.label;
      input.setAttribute('placeholder', c.placeholder);
      input.setAttribute('maxlength', String(c.max + 2));
      var ke = currentDisco() && currentDisco().portal === 'ke';
      if (tabsWrap) { if (ke) addCls(tabsWrap, 'opacity-60'); else rmCls(tabsWrap, 'opacity-60'); }
      tabs.forEach(function (t) { t.disabled = !!ke; });
      if (ke && st.mode !== 'ref') setMode('ref');
    }
    function setMode(mode) {
      if (currentDisco() && currentDisco().portal === 'ke') mode = 'ref';
      st.mode = (mode === 'cid') ? 'cid' : 'ref';
      if (slider) slider.style.left = st.mode === 'ref' ? '4px' : 'calc(50% )';
      tabs.forEach(function (t) {
        var isRef = t.textContent.trim() === 'Reference No.';
        var active = (st.mode === 'ref') === isRef;
        rmCls(t, 'text-emerald-700 text-slate-700 hover:text-slate-900');
        addCls(t, active ? 'text-emerald-700' : 'text-slate-700 hover:text-slate-900');
      });
      clearError();
      renderFieldConfig();
      applyMaxSlice();
      renderValue();
    }
    function applyMaxSlice() {
      var c = cfg();
      if (st.value.length > c.max) st.value = st.value.slice(0, c.max);
    }
    function setValue(raw) {
      var c = cfg();
      st.value = String(raw || '').replace(/\D/g, '').slice(0, c.max);
      clearError();
      renderValue();
    }

    /* ---------- disco button / dropdown ---------- */
    function monoMarkup(disco, size) {
      var label = disco.short.slice(0, disco.short.length > 5 ? 2 : 3);
      return '<span class="grid shrink-0 place-items-center rounded-xl font-display text-[11px] font-bold text-white shadow-sm" style="width: ' + size + 'px; height: ' + size + 'px; background: linear-gradient(135deg, ' + disco.color + ', ' + disco.color + 'cc);">' + label + '</span>';
    }
    function renderDiscoButton() {
      var disco = currentDisco();
      if (disco) {
        if (monoSlot && !monoSlot.hasAttribute('data-bb-mono')) {
          var tmp = d.createElement('div');
          tmp.innerHTML = monoMarkup(disco, 36);
          monoSlot.replaceWith(tmp.firstChild);
          monoSlot = $('span.grid', btn);
          monoSlot.setAttribute('data-bb-mono', '1');
        } else if (monoSlot) {
          monoSlot.outerHTML = monoMarkup(disco, 36);
          monoSlot = $('span.grid', btn);
          monoSlot.setAttribute('data-bb-mono', '1');
        }
        if (nameEl) nameEl.textContent = disco.short;
        if (subEl) subEl.textContent = disco.name + ' \u00b7 ' + disco.region;
      } else {
        if (nameEl) nameEl.textContent = 'Choose your power company';
        if (subEl) subEl.textContent = '11 DISCOs + K-Electric';
      }
      if (list) $$('[role="option"]', list).forEach(function (o) { o.setAttribute('aria-selected', o.getAttribute('data-bb-disco') === st.discoId ? 'true' : 'false'); });
    }
    function setDisco(id, opts) {
      st.discoId = discoById(id) ? id : null;
      var disco = currentDisco();
      st.mode = (disco && disco.portal === 'ke') ? 'ref' : st.mode;
      clearError();
      renderDiscoButton();
      renderFieldConfig();
      applyMaxSlice();
      renderValue();
      renderHero(disco, opts && opts.silent);
      renderSaved();
      closePanel();
    }

    function openPanel() {
      if (!panel) return;
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      rmCls(btn, 'border-slate-200 hover:border-emerald-300');
      addCls(btn, 'border-emerald-500 ring-4 ring-emerald-500/15');
      if (chev) addCls(chev, 'rotate-180');
      if (searchInp) { searchInp.value = ''; filterList(''); setTimeout(function () { try { searchInp.focus({ preventScroll: true }); } catch (e) {} }, 30); }
    }
    function closePanel() {
      if (!panel) return;
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      rmCls(btn, 'border-emerald-500 ring-4 ring-emerald-500/15');
      addCls(btn, st.discoId ? 'border-emerald-500 ring-4 ring-emerald-500/15' : 'border-slate-200 hover:border-emerald-300');
      if (chev) rmCls(chev, 'rotate-180');
    }
    function filterList(q) {
      if (!list) return;
      q = String(q || '').trim().toLowerCase();
      $$('li', list).forEach(function (li) {
        var disco = discoById(li.querySelector('[data-bb-disco]') && li.querySelector('[data-bb-disco]').getAttribute('data-bb-disco'));
        if (!disco) { li.hidden = false; return; }
        var hay = (disco.short + disco.name + disco.region + disco.cities.join(' ')).toLowerCase();
        li.hidden = q.length > 0 && hay.indexOf(q) === -1;
      });
    }

    /* ---------- saved numbers ---------- */
    var savedArea = null;
    function renderSaved() {
      if (!st.saved.length) { if (savedArea) { savedArea.remove(); savedArea = null; } return; }
      var chips = st.saved.map(function (s, i) {
        var disco = discoById(s.discoId) || DISCOS[0];
        return '<span class="group/chip inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:border-emerald-300">' +
          '<button type="button" data-bb-saved="' + i + '" class="flex items-center gap-1.5 py-1.5 pl-2.5 pr-1.5">' +
          '<span class="h-2 w-2 rounded-full" style="background: ' + disco.color + ';"></span>' + disco.short +
          '<span class="font-mono text-slate-400">' + maskTail(s.value) + '</span></button>' +
          '<button type="button" data-bb-remove="' + i + '" aria-label="Remove saved number" class="px-2 py-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600">' +
          '<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg></button></span>';
      }).join('');
      if (!savedArea) {
        savedArea = d.createElement('div');
        savedArea.className = 'relative mt-5 border-t border-slate-100 pt-4';
        savedArea.innerHTML =
          '<div class="mb-2 flex items-center justify-between">' +
            '<span class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">' +
              '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5M12 7v5l3 2"></path></svg> Saved on this device</span>' +
            '<button type="button" data-bb-clear class="text-xs font-semibold text-slate-400 transition hover:text-rose-600">Clear all</button>' +
          '</div><div class="flex flex-wrap gap-2" data-bb-chips></div>';
        form.insertAdjacentElement('afterend', savedArea);
      }
      $('[data-bb-chips]', savedArea).innerHTML = chips;
    }
    on(card, 'click', function (e) {
      var chip = e.target.closest('[data-bb-saved]');
      var rem = e.target.closest('[data-bb-remove]');
      var clr = e.target.closest('[data-bb-clear]');
      if (rem) {
        st.saved.splice(+rem.getAttribute('data-bb-remove'), 1);
        persistSaved(); renderSaved(); return;
      }
      if (clr) { st.saved = []; persistSaved(); renderSaved(); return; }
      if (chip) {
        var s = st.saved[+chip.getAttribute('data-bb-saved')];
        if (!s) return;
        if (st.discoId !== s.discoId) { st.discoId = s.discoId; renderDiscoButton(); renderHero(currentDisco()); }
        st.mode = s.mode === 'cid' ? 'cid' : 'ref';
        setMode(st.mode);
        setValue(s.value);
        renderSaved();
      }
    });

    /* ---------- paste ---------- */
    var pasteBtn = $$('button', fieldBox).filter(function (b) { return /Paste/.test(b.textContent); })[0];
    on(pasteBtn, 'click', function () {
      if (!navigator.clipboard || !navigator.clipboard.readText) { setError('Clipboard access blocked \u2014 please paste with Ctrl/\u2318+V.'); return; }
      navigator.clipboard.readText().then(function (t) { setValue(t); }).catch(function () { setError('Clipboard access blocked \u2014 please paste with Ctrl/\u2318+V.'); });
    });

    /* ---------- submit ---------- */
    var noteEl = null;
    function showNote(msg) {
      if (!msg) { if (noteEl) { noteEl.remove(); noteEl = null; } return; }
      if (!noteEl) {
        noteEl = d.createElement('p');
        noteEl.className = 'mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700';
        noteEl.innerHTML = '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg> <span></span>';
        form.appendChild(noteEl);
      }
      noteEl.querySelector('span').textContent = msg;
    }
    on(form, 'submit', function (e) {
      e.preventDefault();
      var disco = currentDisco();
      var c = cfg();
      if (!disco) { setError('Pehle apni DISCO select karein.'); renderInputState(); return; }
      var valid = st.value.length >= c.min && st.value.length <= c.max;
      if (!valid) {
        setError(c.short + ' poora likhein (' + st.value.length + '/' + (c.min === c.max ? c.max : c.min + '\u2013' + c.max) + ' digits).');
        renderInputState();
        return;
      }
      var url = targetUrl(disco, st.mode, st.value);
      var q, i;
      if (disco.id === 'lesco' && st.mode === 'cid') {
        q = d.createElement('form');
        q.method = 'POST'; q.action = LESCO_MENU_URL; q.target = '_blank'; q.rel = 'noopener noreferrer';
        [['txtCustID', st.value], ['btnViewMenu', 'Customer Menu']].forEach(function (kv) {
          i = d.createElement('input'); i.type = 'hidden'; i.name = kv[0]; i.value = kv[1]; q.appendChild(i);
        });
      } else {
        q = d.createElement('form');
        q.method = 'POST'; q.action = url; q.target = '_blank'; q.rel = 'noopener noreferrer';
      }
      d.body.appendChild(q); q.submit(); q.remove();
      var copyMsg = '';
      if (disco.portal === 'ke' || st.mode === 'cid') {
        try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(st.value).catch(function () {}); } catch (err) {}
        copyMsg = 'Number copied \u2014 paste it on the official page.';
      }
      showNote(copyMsg);
      if (st.saveOn) {
        st.saved = [{ discoId: disco.id, mode: st.mode, value: st.value, ts: Date.now() }].concat(
          st.saved.filter(function (z) { return !(z.discoId === disco.id && z.value === st.value); })
        ).slice(0, 5);
        persistSaved(); renderSaved();
      }

    });

    on(input, 'input', function () { setValue(input.value); });
    on(input, 'keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true })); }
    });
    on(saveChk, 'change', function () { st.saveOn = !!saveChk.checked; });

    /* ---------- dropdown wiring ---------- */
    on(btn, 'click', function (e) {
      e.preventDefault();
      if (panel && !panel.hidden) closePanel(); else openPanel();
    });
    if (searchInp) on(searchInp, 'input', function () { filterList(searchInp.value); });
    if (list) on(list, 'click', function (e) {
      var opt = e.target.closest('[data-bb-disco]');
      if (opt) setDisco(opt.getAttribute('data-bb-disco'));
    });
    on(d, 'mousedown', function (e) { if (panel && !panel.hidden && btnWrap && !btnWrap.contains(e.target)) closePanel(); });
    on(d, 'keydown', function (e) { if (e.key === 'Escape' && panel && !panel.hidden) closePanel(); });
    /* ---------- mode tabs (Reference No. / Customer ID) ---------- */
    tabs.forEach(function (t) {
      on(t, 'click', function () {
        if (t.disabled) return;
        setMode(t.textContent.trim() === 'Reference No.' ? 'ref' : 'cid');
      });
    });

    /* ---------- boot ---------- */
    renderDiscoButton();
    renderFieldConfig();
    renderValue();
    renderSaved();
    if (st.discoId) renderHero(currentDisco());
    else renderHero(null);
  }

  /* ============================ 2. hero (accent + typewriter + paragraph) ============================ */

  var heroTimer = null;
  function renderHero(disco, silent) {
    var top = $('#top');
    if (!top) return;
    var accent = (disco && disco.color) || '#059669';
    var h1 = $('h1', top);
    var accentSpan = h1 ? $('span.relative.inline-block', h1) : null;
    var cursor = accentSpan ? $('span.animate-blink', accentSpan) : null;
    /* app: `ae = F[W].color` is applied to the section, the H1 word and the cursor
       (drives the glow behind the card, the spotlight, the canvas + border-spin) */
    function applyAccent(color) {
      try { top.style.setProperty('--accent', color); } catch (e) {}
      if (accentSpan) accentSpan.style.color = color;
      if (cursor) cursor.style.background = color;
    }
    applyAccent(accent);
    /* paragraph */
    var p = $('p.mt-7', top);
    if (p) {
      if (disco) {
        var host = disco.portal === 'ke' ? 'ke.com.pk' : 'bill.pitc.com.pk';
        p.innerHTML = '<b class="font-bold text-slate-900">' + disco.name + '</b> selected \u2014 enter your number on the right and a new tab opens straight to your bill on <b class="font-semibold text-slate-900">' + host + '</b>.';
      } else if (!p.getAttribute('data-bb-default')) {
        p.innerHTML = 'Select your DISCO and reference number \u2014 a new tab opens straight to your bill on the official PITC portal (you\u2019ll see <b class="font-semibold text-slate-900">bill.pitc.com.pk</b> in the address bar). No signup \u2014 saved numbers stay in your browser only.';
        p.setAttribute('data-bb-default', '1');
      }
    }
    /* typewriter in H1 */
    if (heroTimer) { clearTimeout(heroTimer); heroTimer = null; }
    if (!accentSpan) return;
    /* make sure a text node exists before the cursor span */
    var tn = accentSpan.firstChild;
    if (!tn || tn.nodeType !== 3) {
      tn = d.createTextNode('');
      accentSpan.insertBefore(tn, accentSpan.firstChild);
    }
    var cycle = [{ label: 'bijlee', color: '#059669' }].concat(
      DISCOS.map(function (x) { return { label: x.short, color: x.color }; }));
    var texts = disco ? [disco.short] : cycle.map(function (c) { return c.label; });
    var cols = disco ? [disco.color] : cycle.map(function (c) { return c.color; });
    var fixed = !!disco;
    if (reduced()) { tn.nodeValue = texts[0]; applyAccent(cols[0]); return; }
    var idx = 0, cur = '';
    function step() {
      var target = texts[idx];
      if (target.indexOf(cur) === 0 && cur.length < target.length) {      /* typing */
        cur = target.slice(0, cur.length + 1);
        tn.nodeValue = cur;
        heroTimer = setTimeout(step, 85);
      } else if (target.indexOf(cur) === 0 && cur === target) {            /* complete → hold */
        if (fixed) return;
        heroTimer = setTimeout(function () { cur = target; del(); }, 1800);
      } else if (cur.length > 0) {                                        /* deleting */
        cur = cur.slice(0, -1);
        tn.nodeValue = cur;
        heroTimer = setTimeout(step, 32);
      } else {                                                            /* next word */
        idx = (idx + 1) % texts.length;
        heroTimer = setTimeout(step, 60);
      }
    }
    function del() { cur = cur.slice(0, -1); tn.nodeValue = cur; heroTimer = setTimeout(cur.length ? del : next, 32); }
    function next() { idx = (idx + 1) % texts.length; applyAccent(cols[idx]); step(); }
    cur = ''; tn.nodeValue = ''; applyAccent(cols[0]); step();
  }

  /* ============================ 3. hero network canvas ============================ */

  function initCanvas() {
    var canvas = $('canvas');
    if (!canvas || !canvas.getContext) return;
    var host = canvas.closest('[data-network-host]') || canvas.parentElement;
    var top = $('#top');
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, pts = [], mouse = { x: -9999, y: -9999, on: false }, pulses = [], ripples = [], nbr = [], lastPulse = 0, raf = 0, running = false;
    var LINK = 150, MRAD = 200;

    function accent() {
      var c = top && getComputedStyle(top).getPropertyValue('--accent');
      return hexToRgb((c || '').trim() || '#059669');
    }
    function resize() {
      var r = host.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!pts.length) {
        var n = Math.round(Math.min(90, Math.max(26, W * H / 15000)));
        pts = [];
        for (var i = 0; i < n; i++) pts.push({ nx: Math.random(), ny: Math.random(), vx: (Math.random() - .5) * 18e-5, vy: (Math.random() - .5) * 28e-5, r: 1.2 + Math.random() * 1.7, glow: 0 });
      }
      /* soft reset positions of the mouse glow */
      draw(false, 0);
    }
    function draw(animate, ts) {
      var rgb = accent();
      ctx.clearRect(0, 0, W, H);
      var n = pts.length, i, j, x = [], y = [];
      for (i = 0; i < n; i++) {
        var p = pts[i];
        if (animate) {
          p.nx += p.vx; p.ny += p.vy;
          if (p.nx < 0 || p.nx > 1) p.vx *= -1;
          if (p.ny < 0 || p.ny > 1) p.vy *= -1;
          p.glow *= 0.94;
        }
        x[i] = p.nx * W; y[i] = p.ny * H;
      }
      ctx.lineWidth = 1;
      nbr = pts.map(function () { return []; });
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
        var dx = x[i] - x[j], dy = y[i] - y[j], dist2 = dx * dx + dy * dy;
        if (dist2 < LINK * LINK) {
          var dist = Math.sqrt(dist2);
          nbr[i].push(j); nbr[j].push(i);
          var g = Math.max(pts[i].glow, pts[j].glow);
          ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + ((1 - dist / LINK) * (.12 + g * .35)).toFixed(4) + ')';
          ctx.beginPath(); ctx.moveTo(x[i], y[i]); ctx.lineTo(x[j], y[j]); ctx.stroke();
        }
      }
      if (mouse.on) {
        for (i = 0; i < n; i++) {
          var mx = x[i] - mouse.x, my = y[i] - mouse.y, md = Math.sqrt(mx * mx + my * my);
          if (md < MRAD) {
            var f = 1 - md / MRAD;
            pts[i].glow = Math.max(pts[i].glow, f);
            ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (f * .55).toFixed(4) + ')';
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(x[i], y[i]); ctx.stroke();
            ctx.lineWidth = 1;
          }
        }
        var grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 26);
        grd.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.35)');
        grd.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 26, 0, Math.PI * 2); ctx.fill();
      }
      for (i = 0; i < n; i++) {
        var pt = pts[i];
        if (pt.glow > .08) {
          ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (pt.glow * .16).toFixed(4) + ')';
          ctx.beginPath(); ctx.arc(x[i], y[i], 9 + pt.glow * 9, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (.32 + pt.glow * .6).toFixed(4) + ')';
        ctx.beginPath(); ctx.arc(x[i], y[i], pt.r + pt.glow * 2.2, 0, Math.PI * 2); ctx.fill();
      }
      /* travelling pulses */
      for (i = pulses.length - 1; i >= 0; i--) {
        var pu = pulses[i], a = pts[pu.a], b = pts[pu.b];
        if (!a || !b) { pulses.splice(i, 1); continue; }
        if (animate) pu.t += pu.speed;
        if (pu.t >= 1) {
          if (pts[pu.b]) pts[pu.b].glow = 1;                       /* app: arrival lights the node */
          if (pu.hops > 0 && nbr[pu.b] && nbr[pu.b].length) {      /* app: hops counts down to 0 */
            var others = nbr[pu.b].filter(function (z) { return z !== pu.a; });
            var pick = (others.length ? others : nbr[pu.b])[Math.floor(Math.random() * (others.length || nbr[pu.b].length))];
            pulses.splice(i, 1);
            pulses.push({ a: pu.b, b: pick, t: 0, speed: pu.speed, hops: pu.hops - 1, amber: pu.amber });
          } else { pulses.splice(i, 1); }
          continue;
        }
        var px = x[pu.a] + (x[pu.b] - x[pu.a]) * pu.t, py = y[pu.a] + (y[pu.b] - y[pu.a]) * pu.t;
        var tx = Math.max(0, pu.t - .2);
        var qx = x[pu.a] + (x[pu.b] - x[pu.a]) * tx, qy = y[pu.a] + (y[pu.b] - y[pu.a]) * tx;
        var col = pu.amber ? [245, 158, 11] : rgb;
        var grd2 = ctx.createLinearGradient(qx, qy, px, py);
        grd2.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
        grd2.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',.95)');
        ctx.strokeStyle = grd2; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px, py); ctx.stroke();
        ctx.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
        ctx.shadowColor = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(px, py, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      /* click ripples (app: pointerdown -> expanding ring + node glow) */
      for (var ri = ripples.length - 1; ri >= 0; ri--) {
        var rp = ripples[ri];
        if (animate) rp.t += .022;
        if (rp.t >= 1) { ripples.splice(ri, 1); continue; }
        ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + ((1 - rp.t) * .4).toFixed(4) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.t * 300, 0, Math.PI * 2); ctx.stroke();
        for (var q = 0; q < pts.length; q++) {
          var dd = Math.hypot(x[q] - rp.x, y[q] - rp.y);
          if (Math.abs(dd - rp.t * 300) < 14) pts[q].glow = Math.max(pts[q].glow, 1 - rp.t);
        }
      }
      /* ambient pulses: one every 420 ms while animating, max 22 (app cadence) */
      if (animate && !reduced() && ts && ts - lastPulse > 420 && pulses.length < 22) {
        lastPulse = ts;
        var cand = [];
        for (i = 0; i < n; i++) if (nbr[i].length) cand.push(i);
        if (cand.length) {
          var a2 = cand[Math.floor(Math.random() * cand.length)];
          var b2 = nbr[a2][Math.floor(Math.random() * nbr[a2].length)];
          pulses.push({ a: a2, b: b2, t: 0, speed: .011 + Math.random() * .012, hops: 3, amber: Math.random() < .3 });
        }
      }
    }
    function loop(ts) {
      if (!running) return;
      if (!d.hidden) { try { draw(true, ts); } catch (e) {} }
      raf = requestAnimationFrame(loop);
    }
    function start() { if (running || reduced()) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    on(window, 'resize', resize);
    if ('ResizeObserver' in window) { try { new ResizeObserver(function () { resize(); }).observe(host); } catch (e) {} }
    on(d, 'visibilitychange', function () { if (d.hidden) stop(); else start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
      }, { rootMargin: '120px' }).observe(host);
    }
    if (host) {
      on(host, 'pointermove', function (e) {
        var r = host.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;   /* app: no touch filter */
        if (top) {
          top.style.setProperty('--sx', (e.clientX - r.left) + 'px');
          top.style.setProperty('--sy', (e.clientY - r.top) + 'px');
        }
      });
      on(host, 'pointerleave', function () { mouse.on = false; mouse.x = mouse.y = -9999; });
      on(host, 'pointerdown', function (e) {
        var r = host.getBoundingClientRect();
        var mx = e.clientX - r.left, my = e.clientY - r.top;
        ripples.push({ x: mx, y: my, t: 0 });
        var near = pts.map(function (q, idx) { return { i: idx, d: Math.hypot(q.nx * W - mx, q.ny * H - my) }; })
                      .sort(function (p1, p2) { return p1.d - p2.d; }).slice(0, 4);
        near.forEach(function (o2) {
          pts[o2.i].glow = 1;
          if (nbr[o2.i] && nbr[o2.i].length) {
            pulses.push({ a: o2.i, b: nbr[o2.i][Math.floor(Math.random() * nbr[o2.i].length)], t: 0,
                          speed: .011 + Math.random() * .012, hops: 3, amber: Math.random() < .3 });
          }
        });
      });
    }
    resize();
    if (reduced()) draw(false, 0); else start();
  }

  /* ============ 3b. hero parallax + checker-card tilt (ports so() / S0()) ============ */

  function initHeroParallax() {
    var top = $('#top');
    if (!top) return;
    var vis = $('.bb-mobile-checker-first', top);   /* app's ref x: the depth-layer wrapper */
    function clamp1(v) { return v < -1 ? -1 : (v > 1 ? 1 : v); }

    /* section pointer: --sx/--sy spotlight (px from section origin) + --mx/--my depth parallax */
    on(top, 'pointermove', function (e) {
      var sr = top.getBoundingClientRect();
      top.style.setProperty('--sx', (e.clientX - sr.left) + 'px');
      top.style.setProperty('--sy', (e.clientY - sr.top) + 'px');
      if (!vis) return;
      var vr = vis.getBoundingClientRect();
      var mx = clamp1((e.clientX - (vr.left + vr.width / 2)) / (window.innerWidth / 2));
      var my = clamp1((e.clientY - (vr.top + vr.height / 2)) / (window.innerHeight / 2));
      vis.style.setProperty('--mx', mx.toFixed(3));
      vis.style.setProperty('--my', my.toFixed(3));
    });

    /* checker card 3D tilt: perspective(1100px) rotateY .5..6deg / rotateX .5..5deg + spotlight vars */
    var card = $('#checker-card');
    if (!card) return;
    on(card, 'pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = card.getBoundingClientRect();
      var b = (e.clientX - r.left) / r.width;
      var z = (e.clientY - r.top) / r.height;
      card.style.transform = 'perspective(1100px) rotateY(' + ((b - .5) * 6) + 'deg) rotateX(' + ((.5 - z) * 5) + 'deg)';
      card.style.setProperty('--gx', (b * 100) + '%');
      card.style.setProperty('--gy', (z * 100) + '%');
    });
    on(card, 'pointerleave', function () { card.style.transform = ''; });
  }

  /* ============================ 4. bill calculator ============================ */

  var SLABS = {
    protected: [
      { max: 50,  rate: 3.95,  label: 'Lifeline \u00b7 1\u201350' },
      { max: 100, rate: 7.74,  label: '51\u2013100' },
      { max: 200, rate: 10.06, label: '101\u2013200' }
    ],
    unprotected: [
      { max: 100, rate: 22.44, label: '1\u2013100' },
      { max: 200, rate: 28.91, label: '101\u2013200' },
      { max: 300, rate: 33.1,  label: '201\u2013300' },
      { max: 400, rate: 36.46, label: '301\u2013400' },
      { max: 500, rate: 38.95, label: '401\u2013500' },
      { max: 600, rate: 40.22, label: '501\u2013600' },
      { max: 700, rate: 41.62, label: '601\u2013700' },
      { max: Infinity, rate: 47.2, label: 'Above 700' }
    ],
    commercial: [
      { max: 100, rate: 33.5, label: '1\u2013100' },
      { max: 300, rate: 38.1, label: '101\u2013300' },
      { max: Infinity, rate: 43.4, label: 'Above 300' }
    ]
  };
  var CAT_LABEL = { protected: 'Protected', unprotected: 'Unprotected', commercial: 'Commercial' };
  var TV_FEE = 35;

  function calcBill(inp) {                                   /* port of F0() */
    var downgraded = inp.category === 'protected' && inp.units > 200;
    var eff = downgraded ? 'unprotected' : inp.category;
    var arr = SLABS[eff] || SLABS.unprotected;
    var idx = -1;
    for (var i = 0; i < arr.length; i++) { if (inp.units <= arr[i].max) { idx = i; break; } }
    if (idx < 0) idx = arr.length - 1;
    var slab = arr[idx];
    var base;
    if (inp.phase === 'three') {
      var peak = Math.min(Math.max(inp.peakUnits || 0, 0), inp.units);
      base = peak * inp.touPeak + (inp.units - peak) * inp.touOff;
    } else {
      base = inp.units * slab.rate;
    }
    var fpa = inp.units * inp.fpaRate;
    var ed = base * 0.015;
    var gst = (base + ed + fpa) * 0.18;
    var tv = TV_FEE;
    var total = inp.units > 0 ? base + ed + gst + tv + fpa : 0;
    return { effective: eff, downgraded: downgraded, slab: slab, slabIndex: idx,
             base: base, ed: ed, gst: gst, tv: tv, fpa: fpa, total: total };
  }

  function initCalculator() {
    var calc = $('#calculator');
    if (!calc) return;
    var unitsNum = $('input[aria-label="Units value"]', calc);
    var range = $('#unitsRange', calc);
    var phaseSel = $('#phaseSel', calc);
    var peakUnits = $('#peakUnits', calc);
    var fpaRate = $('#fpaRate', calc);
    var touPeak = $('#touPeak', calc);
    var touOff = $('#touOff', calc);
    if (!unitsNum) return;
    var presets = $$('button', calc).filter(function (b) { return /^\d+ units$/.test(b.textContent.trim()); });
    var cats = $$('button', calc).filter(function (b) { return !!CAT_LABEL[b.textContent.trim().toLowerCase()]; });
    var bigTotal = $('[data-bb="bigTotal"]', calc);
    var grand = $('[data-bb="val-total"]', calc);
    var fpaBadge = $('[data-bb="fpaBadge"]', calc);
    var rows = {
      base: $('[data-bb="val-base"]', calc), ed: $('[data-bb="val-ed"]', calc),
      gst: $('[data-bb="val-gst"]', calc), tv: $('[data-bb="val-tv"]', calc),
      fpa: $('[data-bb="val-fpa"]', calc)
    };
    var segs = [0, 1, 2, 3, 4].map(function (i) { return $('[data-bb="seg' + i + '"]', calc); });
    var pcts = [0, 1, 2, 3, 4].map(function (i) { return $('[data-bb="pct' + i + '"]', calc); });
    var ladderLabel = $('[data-bb="ladderLabel"]', calc);
    var ladder = $('[data-bb="ladder"]', calc);
    var st = { category: 'unprotected', phase: 'single' };
    cats.forEach(function (b) {
      if (/bg-white/.test(b.className)) st.category = b.textContent.trim().toLowerCase();
    });

    var PRE_ON = 'border-emerald-600 bg-emerald-600 text-white';
    var PRE_OFF = 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700';
    var CAT_ON = 'bg-white text-emerald-700 shadow';
    var CAT_OFF = 'text-slate-500 hover:text-slate-800';

    function units() { return Math.max(0, Math.min(5000, parseInt(unitsNum.value, 10) || 0)); }
    function numv(el) { var v = parseFloat(el && el.value); return isFinite(v) ? Math.max(0, v) : 0; }

    function renderPresets(u) {
      presets.forEach(function (b) {
        var active = parseInt(b.textContent, 10) === u;
        rmCls(b, PRE_ON + ' ' + PRE_OFF);
        addCls(b, active ? PRE_ON : PRE_OFF);
      });
    }
    function renderCats() {
      cats.forEach(function (b) {
        var active = b.textContent.trim().toLowerCase() === st.category;
        rmCls(b, CAT_ON + ' ' + CAT_OFF);
        addCls(b, active ? CAT_ON : CAT_OFF);
      });
    }
    function renderBarTitles(r) {
      var parts = [
        ['Base tariff', r.base], ['FPA', r.fpa], ['GST 18%', r.gst], ['ED 1.5%', r.ed], ['TV fee', r.tv]
      ];
      var tot = r.total || 1;
      parts.forEach(function (p, i) {
        var w = (p[1] / tot) * 100;
        if (segs[i]) {
          segs[i].style.width = prec6(w) + '%';
          segs[i].setAttribute('title', p[0] + ': Rs ' + fmt2(p[1]));
        }
        if (pcts[i]) pcts[i].textContent = Math.round(w) + '%';
      });
    }
    function renderLadder(r) {
      var arr = SLABS[r.effective] || SLABS.unprotected;
      var maxRate = arr[arr.length - 1].rate;
      if (ladderLabel) ladderLabel.textContent = CAT_LABEL[r.effective] + ' slab ladder';
      if (!ladder) return;
      ladder.innerHTML = arr.map(function (s, i) {
        var on = i === r.slabIndex;
        var h = 14 + (s.rate / maxRate) * 54;
        return '<div class="flex flex-1 flex-col items-center gap-1.5">' +
          '<span class="font-mono text-[10px] font-bold ' + (on ? 'text-emerald-700' : 'text-slate-400') + '">' + s.rate + '</span>' +
          '<div class="w-full rounded-t-lg transition-all duration-500 ' + (on ? 'bg-emerald-500' : 'bg-slate-200') + '" style="height: ' + prec6(h) + 'px;"></div>' +
          '<span class="text-center text-[9px] font-semibold leading-tight ' + (on ? 'text-emerald-700' : 'text-slate-400') + '">' + s.label + '</span></div>';
      }).join('');
    }
    function update() {
      var u = units();
      var r = calcBill({
        units: u, category: st.category, phase: st.phase,
        peakUnits: numv(peakUnits), touPeak: numv(touPeak), touOff: numv(touOff), fpaRate: numv(fpaRate)
      });
      if (bigTotal) bigTotal.textContent = 'Rs. ' + fmt0(r.total);
      if (rows.base) rows.base.textContent = 'Rs. ' + fmt2(r.base);
      if (rows.ed) rows.ed.textContent = 'Rs. ' + fmt2(r.ed);
      if (rows.gst) rows.gst.textContent = 'Rs. ' + fmt2(r.gst);
      if (rows.tv) rows.tv.textContent = 'Rs. ' + fmt2(r.tv);
      if (rows.fpa) rows.fpa.textContent = 'Rs. ' + fmt2(r.fpa);
      if (grand) grand.textContent = 'Rs. ' + fmt0(r.total);
      if (fpaBadge) fpaBadge.textContent = '@ Rs. ' + fmt2(numv(fpaRate)) + ' / unit';
      renderBarTitles(r);
      renderLadder(r);
      renderPresets(u);
    }
    function setUnits(u, fromRange) {
      u = Math.max(0, Math.min(5000, Math.round(u)));
      if (!fromRange) unitsNum.value = String(u);
      if (range) {
        var rv = Math.min(u, parseInt(range.getAttribute('max'), 10) || 1000);
        if (!fromRange || u > rv) range.value = String(rv);
        range.style.setProperty('--p', (Math.min(100, (rv / 1000) * 100)) + '%');
      }
      update();
    }
    function applyPhase() {
      st.phase = phaseSel && phaseSel.value === 'three' ? 'three' : 'single';
      [peakUnits, touPeak, touOff].forEach(function (el) {
        if (!el) return;
        if (st.phase === 'three') el.removeAttribute('disabled'); else el.setAttribute('disabled', '');
      });
      update();
    }

    on(unitsNum, 'input', function () { setUnits(units()); });
    on(range, 'input', function () { setUnits(parseInt(range.value, 10) || 0, true); if (unitsNum) unitsNum.value = range.value; update(); });
    presets.forEach(function (b) { on(b, 'click', function () { setUnits(parseInt(b.textContent, 10) || 0); }); });
    cats.forEach(function (b) { on(b, 'click', function () { st.category = b.textContent.trim().toLowerCase(); renderCats(); update(); }); });
    on(phaseSel, 'change', applyPhase);
    [peakUnits, fpaRate, touPeak, touOff].forEach(function (el) { on(el, 'input', update); });

    renderCats();
    applyPhase();
    setUnits(units());
  }

  /* ============================ 5. FAQ accordion ============================ */

  function initFaq() {
    var faq = $('#faq');
    if (!faq) return;
    var btns = $$('button[aria-expanded]', faq);
    if (!btns.length) return;
    var CARD_EX = 'border-emerald-300 shadow-xl shadow-emerald-900/5';
    var CARD_DF = 'border-slate-200 hover:border-emerald-200';
    function setOpen(btn, open) {
      var card = btn.parentElement;
      var wrap = btn.nextElementSibling;
      var chev = $('span.grid', btn);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { addCls(card, CARD_EX); rmCls(card, CARD_DF); addCls(chev, 'rotate-45 bg-emerald-600 text-white'); rmCls(chev, 'bg-slate-100 text-slate-500'); }
      else { rmCls(card, CARD_EX); addCls(card, CARD_DF); rmCls(chev, 'rotate-45 bg-emerald-600 text-white'); addCls(chev, 'bg-slate-100 text-slate-500'); }
      if (wrap) {
        if (open) { addCls(wrap, 'grid-rows-[1fr]'); rmCls(wrap, 'grid-rows-[0fr]'); }
        else { addCls(wrap, 'grid-rows-[0fr]'); rmCls(wrap, 'grid-rows-[1fr]'); }
      }
    }
    btns.forEach(function (b) {
      on(b, 'click', function () {
        var wasOpen = b.getAttribute('aria-expanded') === 'true';
        btns.forEach(function (o) { setOpen(o, false); });
        if (!wasOpen) setOpen(b, true);
      });
    });
  }

  /* ============================ 6. header (menu + scroll state) ============================ */

  function initHeader() {
    var header = $('header');
    if (!header) return;
    var burger = $('button[aria-label="Toggle menu"]', header);
    var panel = $('#bb-mobile-panel');
    var scrolledCls = 'border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl';
    var menuOpen = false;

    function applyHeader() {
      if (window.scrollY > 12 || menuOpen) { addCls(header, scrolledCls); rmCls(header, 'bg-transparent'); }
      else { rmCls(header, scrolledCls); addCls(header, 'bg-transparent'); }
    }
    function setMenu(open) {
      if (!panel || !burger) return;
      menuOpen = !!open;
      panel.hidden = !menuOpen;
      burger.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
      var icons = $$('svg', burger);
      if (icons[0]) icons[0].classList.toggle('hidden', menuOpen);
      if (icons[1]) icons[1].classList.toggle('hidden', !menuOpen);
      applyHeader();
    }
    on(burger, 'click', function () { setMenu(!menuOpen); });
    on(d, 'keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    if (panel) on(panel, 'click', function (e) { if (e.target.closest('a')) setMenu(false); });
    on(window, 'scroll', applyHeader, { passive: true });
    applyHeader();
  }

  /* ============================ 7. blog filters ============================ */

  function initBlog() {
    var blog = $('#blog');
    if (!blog) return;
    var chips = $$('button', blog).filter(function (b) { return /^(All|Guides|Explainers|Payment Guides)/.test(b.textContent.trim()); });
    var cards = $$('[data-bb-post]', blog);
    if (!cards.length) return;
    var toggle = $$('button', blog).filter(function (b) { return /Show (all|fewer)/i.test(b.textContent); })[0];
    var expanded = false, current = 'All';

    function counts() {
      var c = { All: 0, Guides: 0, Explainers: 0, 'Payment Guides': 0 };
      cards.forEach(function (card) {
        c.All++;
        var cat = card.getAttribute('data-bb-cat') || '';
        if (c[cat] !== undefined) c[cat]++;
      });
      return c;
    }
    function chipLabel(b) { return b.textContent.trim().replace(/\d+$/, '').trim(); }
    function renderChips() {
      var c = counts();
      chips.forEach(function (b) {
        var label = chipLabel(b), badge = $('span', b), on = (label === current);
        if (badge && c[label] !== undefined) badge.textContent = String(c[label]);
        rmCls(b, 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700');
        addCls(b, on ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                     : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700');
        if (badge) { rmCls(badge, 'text-emerald-100 text-slate-400'); addCls(badge, on ? 'text-emerald-100' : 'text-slate-400'); }
      });
    }
    function renderToggle() {
      if (!toggle) return;
      var total = counts()[current] || 0;
      if (total <= 6) { toggle.hidden = true; return; }
      toggle.hidden = false;
      var label = expanded ? 'Show fewer guides' : 'Show all ' + total + ' guides';
      var svg = $('svg', toggle);
      if (toggle.childNodes[0] && toggle.childNodes[0].nodeType === 3) toggle.childNodes[0].nodeValue = label;
      if (svg) svg.style.transform = expanded ? 'rotate(180deg)' : '';
    }
    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-bb-cat') || '';
        var match = current === 'All' || cat === current;
        var ok = match && (expanded || shown < 6);
        card.hidden = !ok;
        if (ok) shown++;
      });
      renderChips(); renderToggle();
    }
    chips.forEach(function (b) { on(b, 'click', function () { current = chipLabel(b); expanded = false; apply(); }); });
    on(toggle, 'click', function () { expanded = !expanded; apply(); });
    apply();
  }

  /* ============================ 8. live-activity feed ============================ */

  var LIVE_POOL = [
    ['Imran', 'Lahore', 'lesco'], ['Ayesha', 'Karachi', 'ke'], ['Bilal', 'Islamabad', 'iesco'],
    ['Hina', 'Faisalabad', 'fesco'], ['Usman', 'Multan', 'mepco'], ['Sana', 'Peshawar', 'pesco'],
    ['Zain', 'Hyderabad', 'hesco'], ['Farah', 'Gujranwala', 'gepco'], ['Kamran', 'Sukkur', 'sepco'],
    ['Noor', 'Quetta', 'qesco'], ['Adeel', 'Abbottabad', 'hazeco'], ['Sadia', 'Rawalpindi', 'iesco'],
    ['Tariq', 'Sialkot', 'gepco'], ['Mehwish', 'Bahawalpur', 'mepco'], ['Haris', 'Lahore', 'lesco'],
    ['Rabia', 'Multan', 'mepco'], ['Junaid', 'Peshawar', 'pesco'], ['Amna', 'Karachi', 'ke']
  ];
  function initLive() {
    var ul = $('[data-bb="live"]');
    if (!ul) return;
    var pool = LIVE_POOL.slice(), queue = [], i;
    for (i = 0; i < 3; i++) queue.push(next());
    function next() {
      if (!pool.length) pool = LIVE_POOL.slice();
      return pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    }
    function row(entry, rank) {
      var disco = discoById(entry[2]) || DISCOS[0];
      var op = [1, .78, .56][rank] || .56;
      var age = rank === 0 ? 'just now' : (rank === 1 ? '4s ago' : '15s ago');
      return '<li class="flex animate-feed-in items-center gap-3 rounded-xl bg-slate-50/80 px-2.5 py-1.5 transition-opacity" style="opacity: ' + op + ';">' +
        '<span class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style="background: ' + disco.color + ';">' + entry[0].charAt(0) + '</span>' +
        '<p class="min-w-0 flex-1 truncate text-[13px] text-slate-600"><b class="font-semibold text-slate-900">' + entry[0] + '</b> from ' + entry[1] + ' checked a ' +
        '<b class="font-semibold" style="color: ' + disco.color + ';">' + disco.short + '</b> bill</p>' +
        '<span class="shrink-0 font-mono text-[10px] font-medium text-slate-400">' + age + '</span></li>';
    }
    function render() { ul.innerHTML = queue.map(row).join(''); }
    render();
    setInterval(function () {
      if (d.hidden) return;
      queue.unshift(next()); queue.length = 3; render();
    }, 4500);
  }

  /* ============================ boot ============================ */
  ready(function () {
    try { initChecker(); } catch (e) {}
    try { initCalculator(); } catch (e) {}
    try { initFaq(); } catch (e) {}
    try { initHeader(); } catch (e) {}
    try { initBlog(); } catch (e) {}
    try { initLive(); } catch (e) {}
    try { initCanvas(); } catch (e) {}
    try { initHeroParallax(); } catch (e) {}
  });
})();
