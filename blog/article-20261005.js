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
