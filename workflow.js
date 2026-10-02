(() => {
  'use strict';
  const toast = (message) => {
    let el = document.getElementById('bb-workflow-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'bb-workflow-toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:22px;z-index:9999;transform:translate(-50%,12px);opacity:0;pointer-events:none;background:#0a1f18;color:#fff;padding:12px 16px;border-radius:14px;font:600 13px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px #06281c44;transition:opacity .2s,transform .2s;max-width:min(92vw,420px);text-align:left';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = '1'; el.style.transform = 'translate(-50%,0)';
    clearTimeout(el._timer); el._timer = setTimeout(() => { el.style.opacity='0'; el.style.transform='translate(-50%,12px)' }, 4200);
  };
  const fallback = (url) => {
    let box = document.getElementById('bb-workflow-fallback');
    if (!box) {
      box = document.createElement('div'); box.id = 'bb-workflow-fallback';
      box.style.cssText = 'position:fixed;left:50%;bottom:76px;z-index:9998;transform:translateX(-50%);background:#fff;border:1px solid #dbe7e1;border-radius:16px;padding:12px 14px;box-shadow:0 10px 30px #06281c22;display:flex;gap:10px;align-items:center;font:600 13px system-ui,sans-serif;max-width:92vw';
      document.body.appendChild(box);
    }
    box.innerHTML = '<span>Popup blocked?</span><a href="'+url.replace(/"/g,'&quot;')+'" target="_blank" rel="noopener noreferrer" style="color:#047857;font-weight:800">Open official bill →</a>';
    setTimeout(() => box.remove(), 9000);
  };
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !/^https:\/\/(bill\.pitc\.com\.pk|bill\.lesco\.gov\.pk)/.test(form.action)) return;
    form.setAttribute('rel', 'noopener noreferrer');
    toast('Opening the official bill portal…');
    setTimeout(() => fallback(form.action), 350);
  }, true);
  const addDisclaimer = () => {
    if (document.querySelector('.bb-disclaimer')) return;
    const footer = document.querySelector('footer');
    if (!footer) return;
    const p = document.createElement('p');
    p.className = 'bb-disclaimer';
    p.innerHTML = '<strong>Disclaimer:</strong> BijleeBill.pk is an independent bill-checking convenience service and is not affiliated with, endorsed by, or connected to PITC, any DISCO, K-Electric, or the Government of Pakistan. We are not representing any of these organizations. All company names, logos and trademarks shown on this site are the property of their respective owners and are used for identification purposes only. Your reference number is sent directly to the official public portals (bill.pitc.com.pk / ke.com.pk); saved numbers stay in your browser only. For payments, always use official DISCO / bank channels.';
    p.style.cssText = 'margin:0 auto;padding:18px 20px;border-top:1px solid #eef2f0;max-width:1320px;color:#475569;font:500 12px/1.7 system-ui,sans-serif;text-align:left';
    footer.appendChild(p);
    const c = document.createElement('p');
    c.className = 'bb-disclaimer-copyright';
    c.innerHTML = '<strong>© 2026 <a href="http://BijleeBill.pk" style="color:inherit;text-decoration:none">BijleeBill.pk</a></strong> — Estimates are indicative. Always pay through official DISCO / bank channels.';
    c.style.cssText = 'margin:0 auto;padding:0 20px 18px;max-width:1320px;color:#475569;font:500 12px/1.7 system-ui,sans-serif;text-align:left';
    footer.appendChild(c);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addDisclaimer); else addDisclaimer();
  new MutationObserver(addDisclaimer).observe(document.documentElement, { childList:true, subtree:true });
  const addDiscoDropdown = () => {
    const nav = document.querySelector('header nav');
    if (!nav || nav.querySelector('.bb-disco-dropdown')) return;
    [...nav.children].filter(el => /^DISCOs\b/i.test((el.textContent || '').trim())).forEach(el => el.remove());
    const wrap = document.createElement('div'); wrap.className='bb-disco-dropdown'; wrap.style.cssText='position:relative;display:inline-block';
    const button = document.createElement('button'); button.type='button'; button.textContent='DISCOs ▾'; button.style.cssText='border:0;background:transparent;border-radius:999px;padding:8px 14px;color:#475569;font:600 14px inherit;cursor:pointer';
    const menu = document.createElement('div'); menu.style.cssText='display:none;position:absolute;top:100%;right:0;z-index:100;background:#fff;border:1px solid #dbe7e1;border-radius:16px;padding:8px;min-width:190px;box-shadow:0 18px 40px #064e3b22;grid-template-columns:1fr 1fr;gap:2px';
    Object.entries({LESCO:'lesco',IESCO:'iesco',GEPCO:'gepco',FESCO:'fesco',MEPCO:'mepco',PESCO:'pesco',HESCO:'hesco',SEPCO:'sepco',QESCO:'qesco',TESCO:'tesco',HAZECO:'hazeco','K-Electric':'k-electric'}).forEach(([name,slug])=>{const a=document.createElement('a');a.textContent=name;a.href='/disco/'+slug+'/';a.style.cssText='padding:9px 10px;border-radius:9px;color:#475569;text-decoration:none;font:600 12px system-ui,sans-serif';a.onmouseenter=()=>a.style.background='#ecfdf5';a.onmouseleave=()=>a.style.background='transparent';menu.appendChild(a)});
    button.onclick=()=>{menu.style.display=menu.style.display==='grid'?'none':'grid'}; wrap.append(button,menu); nav.appendChild(wrap);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addDiscoDropdown); else addDiscoDropdown();
  new MutationObserver(addDiscoDropdown).observe(document.documentElement,{childList:true,subtree:true});
  const discoRoutes = {LESCO:'lesco', IESCO:'iesco', GEPCO:'gepco', FESCO:'fesco', MEPCO:'mepco', PESCO:'pesco', HESCO:'hesco', SEPCO:'sepco', QESCO:'qesco', TESCO:'tesco', HAZECO:'hazeco', 'K-ELECTRIC':'k-electric'};
  document.addEventListener('click', (event) => {
    const section = event.target.closest?.('#discos');
    if (!section) return;
    const card = event.target.closest('button, a, article, [role="button"]') || event.target;
    const text = (card.textContent || '').toUpperCase();
    const code = Object.keys(discoRoutes).find(key => text.includes(key));
    if (code && !event.defaultPrevented) {
      event.preventDefault();
      location.href = '/disco/' + discoRoutes[code] + '/';
    }
  }, true);
  const blogRoutes = [
    ['LESCO BILL GUIDE','lesco-bill'], ['IESCO BILL GUIDE','iesco-bill'], ['HOW TO PAY ELECTRICITY BILL ONLINE','how-to-pay-electricity-bill-online'], ['ELECTRICITY BILL CALCULATOR','electricity-bill-calculator'], ['ELECTRICITY BILL STATUS CHECK','electricity-bill-status-check']
  ];
  document.addEventListener('click', (event) => {
    const navBlog = event.target.closest?.('a[href="#blog"]');
    if (navBlog) { event.preventDefault(); location.href = '/blog/'; return; }
    const section = event.target.closest?.('#blog');
    if (!section) return;
    const card = event.target.closest('button, a, article, [role="button"]') || event.target;
    const text = (card.textContent || '').toUpperCase();
    const match = blogRoutes.find(([label]) => text.includes(label));
    if (match && !event.defaultPrevented) { event.preventDefault(); location.href = '/blog/' + match[1] + '/'; }
  }, true);
  window.BijleeBillWorkflow = { toast, fallback };
})();
