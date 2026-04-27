document.addEventListener('DOMContentLoaded', () => {

  // ── Ano no footer ──
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Header scroll ──
  const header = document.getElementById('main-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Menu mobile ──
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu    = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      menuToggle.classList.toggle('is-active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('menu-open', isOpen);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('is-active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }
    });
  }

  // ── Scroll suave ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle && menuToggle.classList.remove('is-active');
        menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }
      const offset = (header ? header.offsetHeight : 0) + 8;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Reveal on scroll ──
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    reveals.forEach(el => obs.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // ── Tema claro/escuro ──
  const themeBtn = document.getElementById('theme-toggle');
  const root     = document.documentElement;
  if (themeBtn) {
    const saved = localStorage.getItem('vr_theme');
    root.setAttribute('data-theme', saved === 'dark' ? '' : 'light');
    if (saved === 'dark') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', 'light');

    themeBtn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        localStorage.setItem('vr_theme', 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('vr_theme', 'light');
      }
    });
  }

  // ── Formulário de contato ──
  const form      = document.getElementById('lead-form');
  const submitBtn = document.getElementById('submit-btn');
  const successEl = document.getElementById('form-success');

  if (form) {
    // Validação de campo
    function validateField(input, errorId) {
      const group = input.closest('.form-group');
      const error = document.getElementById(errorId);
      const valid = input.value.trim().length > 0;
      group.classList.toggle('has-error', !valid);
      if (error) error.style.display = valid ? 'none' : 'block';
      return valid;
    }

    // Limpar erro ao digitar
    form.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', () => {
        el.closest('.form-group').classList.remove('has-error');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput    = document.getElementById('client-name');
      const contactInput = document.getElementById('client-contact');
      const reasonInput  = document.getElementById('client-reason');
      const areaInput    = document.getElementById('client-area');

      // Validação
      const v1 = validateField(nameInput, 'error-name');
      const v2 = validateField(contactInput, 'error-contact');
      const v3 = validateField(reasonInput, 'error-reason');
      if (!v1 || !v2 || !v3) return;

      // Loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Estrutura do lead (pronta para enviar ao Firebase / backend)
      const leadData = {
        nome:        nameInput.value.trim(),
        contato:     contactInput.value.trim(),
        area:        areaInput ? areaInput.value : '',
        motivo:      reasonInput.value.trim(),
        status:      'novo_contato',
        origem:      'formulario_site',
        data_criacao: new Date().toISOString(),
      };

      console.log('[Lead] Payload para banco de dados:', leadData);

      // ——————————————————————————————————————————
      // TODO: Substituir o setTimeout abaixo pela chamada real:
      //
      // Firebase Firestore:
      //   await addDoc(collection(db, "leads"), leadData);
      //
      // Ou fetch para sua API REST:
      //   await fetch('/api/leads', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(leadData)
      //   });
      // ——————————————————————————————————————————

      await new Promise(res => setTimeout(res, 1400)); // remover ao integrar

      // Sucesso — mostrar feedback inline (sem alert)
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      form.reset();

      // Esconde o formulário, mostra sucesso
      form.querySelectorAll('.form-group, .form-privacy, #submit-btn').forEach(el => {
        el.style.display = 'none';
      });
      if (successEl) successEl.classList.add('visible');
    });
  }

  // ── Rastrear clique no WhatsApp (Analytics) ──
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'click_whatsapp', { event_category: 'contato' });
      }
    });
  });

});
