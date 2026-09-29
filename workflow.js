(() => {
  'use strict';
  const toast = (message) => {
    let el = document.getElementById('bb-workflow-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'bb-workflow-toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:22px;z-index:9999;transform:translate(-50%,12px);opacity:0;pointer-events:none;background:#0a1f18;color:#fff;padding:12px 16px;border-radius:14px;font:600 13px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px #06281c44;transition:opacity .2s,transform .2s;max-width:min(92vw,420px);text-align:center';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = '1'; el.style.transform = 'translate(-50%,0)';
    clearTimeout(el._timer); el._timer = setTimeout(() => { el.style.opacity='0'; el.style.transform='translate(-50%,12px)'; }, 4200);
  };
  const fallback = (url) => {
    let box = document.getElementById('bb-workflow-fallback');
    if (!box) {
      box = document.createElement('div'); box.id = 'bb-workflow-fallback';
      box.style.cssText = 'position:fixed;left:50%;bottom:76px;z-index:9998;transform:translateX(-50%);background:#fff;border:1px solid #dbe7e1;border-radius:16px;padding:12px 14px;box-shadow:0 10px 30px #06281c22;display:flex;gap:10px;align-items:center;font:600 13px system-ui,sans-serif;max-width:92vw';
      document.body.appendChild(box);
    }
    box.innerHTML = '<span>Popup blocked?</span><a href="'+url.replace(/"/g,'&quot;')+'" target="_blank" rel="noopener" style="color:#047857;font-weight:800">Open official bill →</a>';
    setTimeout(() => box.remove(), 9000);
  };
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !/^https:\/\/(bill\.pitc\.com\.pk|bill\.lesco\.gov\.pk)/.test(form.action)) return;
    toast('Opening the official bill portal…');
    setTimeout(() => fallback(form.action), 350);
  }, true);
  window.BijleeBillWorkflow = { toast, fallback };
})();
