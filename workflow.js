(() => {
  'use strict';
  const toast = (message) => {
    let el = document.getElementById('bb-workflow-toast');
    if (!el) { el=document.createElement('div'); el.id='bb-workflow-toast'; el.style.cssText='position:fixed;left:50%;bottom:22px;z-index:9999;transform:translate(-50%,12px);opacity:0;background:#0a1f18;color:#fff;padding:12px 16px;border-radius:14px;font:600 13px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px #06281c44;transition:.2s;max-width:92vw;text-align:center'; document.body.appendChild(el); }
    el.textContent=message; el.style.opacity='1'; el.style.transform='translate(-50%,0)'; clearTimeout(el._timer); el._timer=setTimeout(()=>{el.style.opacity='0';el.style.transform='translate(-50%,12px)'},4200);
  };
  const openViewer = (url, disco, value, mode) => {
    const shade=document.createElement('div'); shade.id='bb-viewer'; shade.style.cssText='position:fixed;inset:0;z-index:10000;background:linear-gradient(135deg,#f0fdf4,#fff);display:grid;place-items:center;padding:24px;font-family:system-ui,sans-serif';
    shade.innerHTML='<div style="width:min(440px,100%);text-align:center;background:#fff;border:1px solid #dbe7e1;border-radius:28px;padding:34px 24px;box-shadow:0 20px 60px #064e3b20"><div style="margin:auto;width:54px;height:54px;border-radius:16px;background:#059669;color:#fde68a;display:grid;place-items:center;font-size:28px">⚡</div><h2 style="margin:18px 0 8px;color:#0a1f18;font:800 25px Outfit,system-ui">Preparing your bill</h2><p id="bb-viewer-step" style="margin:0;color:#64748b;font-size:14px">Connecting to the official '+disco.toUpperCase()+' portal…</p><div style="height:7px;background:#e2e8f0;border-radius:9px;margin:24px 0 18px;overflow:hidden"><i style="display:block;height:100%;width:35%;background:#10b981;border-radius:9px;animation:bb-progress 1.1s ease-in-out infinite alternate"></i></div><a id="bb-viewer-open" href="'+url.replace(/"/g,'&quot;')+'" target="_blank" rel="noopener" style="display:none;color:#047857;font-weight:800;text-decoration:none">Open official bill →</a></div><style>@keyframes bb-progress{to{width:88%}}</style>';
    document.body.appendChild(shade);
    const step=shade.querySelector('#bb-viewer-step');
    setTimeout(()=>step.textContent='Verifying '+(mode==='cid'?'customer ID':'reference number')+'…',450);
    setTimeout(()=>step.textContent='Opening your official bill…',850);
    setTimeout(()=>{ const w=window.open(url,'_blank','noopener,noreferrer'); const a=shade.querySelector('#bb-viewer-open'); if(!w||w.closed){a.style.display='inline-block'; step.textContent='Your browser blocked the new tab.';} else { a.style.display='inline-block'; } },1100);
    setTimeout(()=>shade.remove(),7000);
  };
  window.BijleeBillWorkflow={toast,openViewer};
})();
