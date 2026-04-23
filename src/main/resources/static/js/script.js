document.addEventListener('DOMContentLoaded', () => {

    // ── Ano no rodapé ──────────────────────────────────────────────────────────
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ── Header scroll ──────────────────────────────────────────────────────────
    const header      = document.getElementById('main-header');
    const menuToggle  = document.getElementById('menu-toggle');
    const navMenu     = document.getElementById('nav-menu');

    if (header) {
        const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll);
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const open = navMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', String(open));
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) navMenu.classList.remove('active');
        });
    }

    // ── Smooth scroll ──────────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (!id || id === '#') return;
            const el = document.querySelector(id);
            if (!el) return;
            e.preventDefault();
            navMenu && navMenu.classList.remove('active');
            const top = el.getBoundingClientRect().top + window.pageYOffset - (header ? header.offsetHeight : 0) + 1;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // ── Reveal on scroll ──────────────────────────────────────────────────────
    const items = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window && items.length) {
        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); o.unobserve(e.target); } });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        items.forEach(i => obs.observe(i));
    } else {
        items.forEach(i => i.classList.add('is-visible'));
    }

    // ── Tema claro/escuro ──────────────────────────────────────────────────────
    const themeBtn = document.getElementById('theme-toggle');
    const root     = document.documentElement;
    if (themeBtn) {
        const saved = localStorage.getItem('adv_theme');
        root.setAttribute('data-theme', saved === 'dark' ? '' : 'light');
        if (saved === 'dark') root.removeAttribute('data-theme');

        themeBtn.addEventListener('click', () => {
            const isLight = root.getAttribute('data-theme') === 'light';
            if (isLight) { root.removeAttribute('data-theme'); localStorage.setItem('adv_theme', 'dark'); }
            else          { root.setAttribute('data-theme', 'light'); localStorage.setItem('adv_theme', 'light'); }
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FORMULÁRIO DE CONTATO → API /api/contatos/publico
    // Cria Cliente + Contato conforme o DER
    // ══════════════════════════════════════════════════════════════════════════
    const form = document.getElementById('lead-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn  = form.querySelector('button[type="submit"]');
            const orig = btn.textContent;

            const payload = {
                nome:     document.getElementById('client-name').value.trim(),
                contato:  document.getElementById('client-contact').value.trim(),
                mensagem: document.getElementById('client-reason').value.trim()
            };

            if (!payload.nome || !payload.contato || !payload.mensagem) {
                showMsg(form, 'Preencha todos os campos.', 'error');
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Enviando...';
            clearMsg(form);

            try {
                const res  = await fetch('/api/contatos/publico', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok) {
                    showMsg(form, '✅ Mensagem enviada! Retornaremos em breve.', 'success');
                    form.reset();
                } else {
                    showMsg(form, '❌ ' + (data.erro || 'Erro ao enviar. Tente novamente.'), 'error');
                }
            } catch {
                showMsg(form, '❌ Erro de conexão. Verifique sua internet.', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = orig;
            }
        });
    }

    function showMsg(form, text, type) {
        clearMsg(form);
        const p = document.createElement('p');
        p.id = 'form-msg';
        p.textContent = text;
        p.style.cssText = `margin-top:1rem;padding:.75rem 1rem;border-radius:6px;font-size:.9rem;font-weight:500;
            text-align:center;
            background:${type === 'success' ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)'};
            color:${type === 'success' ? '#16a34a' : '#dc2626'};
            border:1px solid ${type === 'success' ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`;
        form.appendChild(p);
    }
    function clearMsg(form) {
        document.getElementById('form-msg')?.remove();
    }
});
