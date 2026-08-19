(() => {
  const body = document.body;
  const menuButton = document.getElementById('menuButton');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('.section-anchor')];

  /* --- Menú lateral (móvil) --- */
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    menuButton?.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  menuButton?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  sidebarOverlay?.addEventListener('click', () => setMenu(false));
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

  /* --- Sección activa en la navegación --- */
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: [0, .15, .3] });
  sections.forEach(section => observer.observe(section));

  /* --- Progreso de lectura --- */
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    let ticking = false;
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProgress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateProgress();
  }

  /* --- Contadores animados --- */
  const counters = [...document.querySelectorAll('[data-counter]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.counter || 0);
      obs.unobserve(el);
      if (reduceMotion) {
        el.textContent = target.toLocaleString('es-EC');
        return;
      }
      const duration = 900;
      const start = performance.now();
      const tick = (now) => {
        const progressRatio = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progressRatio, 3);
        el.textContent = Math.round(target * eased).toLocaleString('es-EC');
        if (progressRatio < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: .5 });
  counters.forEach(c => counterObserver.observe(c));

  /* --- Buscador y filtros de módulos --- */
  const moduleSearch = document.getElementById('moduleSearch');
  const moduleCards = [...document.querySelectorAll('.module-card')];
  const filterPills = [...document.querySelectorAll('.filter-pill')];
  const moduleEmpty = document.getElementById('moduleEmpty');
  let activeFilter = 'all';

  const normalize = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const filterModules = () => {
    const query = normalize(moduleSearch?.value || '');
    let visibleCount = 0;
    moduleCards.forEach(card => {
      const categories = card.dataset.category || '';
      const haystack = normalize(`${card.dataset.search || ''} ${card.textContent}`);
      const categoryMatch = activeFilter === 'all' || categories.split(' ').includes(activeFilter);
      const searchMatch = !query || haystack.includes(query);
      const visible = categoryMatch && searchMatch;
      card.classList.toggle('hidden', !visible);
      if (visible) visibleCount++;
    });
    moduleEmpty?.classList.toggle('visible', visibleCount === 0);
  };

  moduleSearch?.addEventListener('input', filterModules);
  filterPills.forEach(pill => {
    pill.setAttribute('aria-pressed', String(pill.classList.contains('active')));
    pill.addEventListener('click', () => {
      activeFilter = pill.dataset.filter;
      filterPills.forEach(p => {
        const active = p === pill;
        p.classList.toggle('active', active);
        p.setAttribute('aria-pressed', String(active));
      });
      filterModules();
    });
  });

  /* --- Acordeón de reportes --- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    const item = trigger.closest('.accordion-item');
    trigger.setAttribute('aria-expanded', String(item?.classList.contains('open')));
    trigger.addEventListener('click', () => {
      const open = item?.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(Boolean(open)));
    });
  });

  /* --- Pestañas de infraestructura --- */
  const infraTabs = [...document.querySelectorAll('.infra-tab')];
  const infraPanels = [...document.querySelectorAll('.infra-panel')];
  infraTabs.forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.dataset.tab);
    tab.setAttribute('aria-selected', String(tab.classList.contains('active')));
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      infraTabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      infraPanels.forEach(panel => panel.classList.toggle('active', panel.id === id));
    });
  });
  infraPanels.forEach(panel => panel.setAttribute('role', 'tabpanel'));

  /* --- Impresión y atajos --- */
  document.getElementById('printButton')?.addEventListener('click', () => window.print());

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
})();
