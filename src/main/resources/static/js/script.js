document.addEventListener('DOMContentLoaded', () => {

    // ── Ano no rodapé ──────────────────────────────
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // ── Header scroll ──────────────────────────────
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);

    menuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // ── Smooth scroll ──────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            e.preventDefault();
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            const headerOffset = header.offsetHeight;
            const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset + 1;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        });
    });

    // ── Reveal on scroll ──────────────────────────
    const revealItems = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window && revealItems.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('is-visible'));
    }

    // ── Tema claro/escuro ─────────────────────────
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootHtml = document.documentElement;

    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('adv_theme');
        if (savedTheme === 'dark') {
            rootHtml.removeAttribute('data-theme');
        } else {
            rootHtml.setAttribute('data-theme', 'light');
        }

        themeToggleBtn.addEventListener('click', () => {
            const isLight = rootHtml.getAttribute('data-theme') === 'light';
            if (isLight) {
                rootHtml.removeAttribute('data-theme');
                localStorage.setItem('adv_theme', 'dark');
            } else {
                rootHtml.setAttribute('data-theme', 'light');
                localStorage.setItem('adv_theme', 'light');
            }
        });
    }

    // ══════════════════════════════════════════════
    // FORMULÁRIO DE CONTATO → API BACKEND REAL
    // ══════════════════════════════════════════════
    const leadForm = document.getElementById('lead-form');

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnSubmit = leadForm.querySelector('button[type="submit"]');
            const originalText = btnSubmit.textContent;

            const leadData = {
                nome:    document.getElementById('client-name').value.trim(),
                contato: document.getElementById('client-contact').value.trim(),
                motivo:  document.getElementById('client-reason').value.trim()
            };

            // Validação simples
            if (!leadData.nome || !leadData.contato || !leadData.motivo) {
                showFormMessage(leadForm, 'Por favor, preencha todos os campos.', 'error');
                return;
            }

            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Enviando...';
            removeFormMessage(leadForm);

            try {
                const response = await fetch('/api/leads/publico', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData)
                });

                const data = await response.json();

                if (response.ok) {
                    showFormMessage(leadForm, '✅ Solicitação enviada com sucesso! Retornaremos em breve.', 'success');
                    leadForm.reset();
                } else {
                    const erroMsg = data.erro || data.message || 'Não foi possível enviar. Tente novamente.';
                    showFormMessage(leadForm, '❌ ' + erroMsg, 'error');
                }

            } catch (err) {
                console.error('Erro ao enviar formulário:', err);
                showFormMessage(leadForm, '❌ Erro de conexão. Verifique sua internet e tente novamente.', 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
            }
        });
    }

    // ── Helpers de mensagem no formulário ─────────
    function showFormMessage(form, text, type) {
        removeFormMessage(form);
        const msg = document.createElement('p');
        msg.id = 'form-feedback';
        msg.textContent = text;
        msg.style.cssText = `
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
            text-align: center;
            background: ${type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'};
            color: ${type === 'success' ? '#16a34a' : '#dc2626'};
            border: 1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};
        `;
        form.appendChild(msg);
    }

    function removeFormMessage(form) {
        const existing = document.getElementById('form-feedback');
        if (existing) existing.remove();
    }
});
