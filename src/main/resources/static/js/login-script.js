document.addEventListener('DOMContentLoaded', () => {

    // Se já tem token válido, redireciona direto para o painel
    const token = localStorage.getItem('adv_token');
    if (token) {
        verificarTokenERedirionar(token);
    }

    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const btn      = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;

            if (!email || !password) {
                showError('Preencha o e-mail e a senha.');
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Autenticando...';
            clearError();

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Salva token e dados do usuário
                    localStorage.setItem('adv_token', data.token);
                    localStorage.setItem('adv_user_nome', data.nome);
                    localStorage.setItem('adv_user_email', data.email);

                    // Redireciona para o painel
                    window.location.href = '/dashboard.html';
                } else {
                    showError(data.erro || 'E-mail ou senha incorretos.');
                }

            } catch (err) {
                console.error('Erro de login:', err);
                showError('Erro de conexão. Tente novamente.');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }

    // ── Helpers ───────────────────────────────────
    function showError(msg) {
        clearError();
        const el = document.createElement('p');
        el.id = 'login-error';
        el.textContent = msg;
        el.style.cssText = `
            margin-top: 0.75rem;
            padding: 0.6rem 1rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            text-align: center;
            background: rgba(239,68,68,0.15);
            color: #dc2626;
            border: 1px solid rgba(239,68,68,0.3);
        `;
        document.querySelector('.login-form').appendChild(el);
    }

    function clearError() {
        const el = document.getElementById('login-error');
        if (el) el.remove();
    }

    async function verificarTokenERedirionar(token) {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.ok) {
                window.location.href = '/dashboard.html';
            } else {
                localStorage.removeItem('adv_token');
            }
        } catch (_) {
            localStorage.removeItem('adv_token');
        }
    }
});
