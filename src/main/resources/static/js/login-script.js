document.addEventListener('DOMContentLoaded', () => {

    // Redireciona se já autenticado
    const token = localStorage.getItem('adv_token');
    if (token) {
        fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(r => { if (r.ok) window.location.href = '/dashboard.html'; })
            .catch(() => localStorage.removeItem('adv_token'));
    }

    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const btn      = form.querySelector('button[type="submit"]');
        const orig     = btn.textContent;

        if (!email || !password) { showErro('Preencha e-mail e senha.'); return; }

        btn.disabled = true;
        btn.textContent = 'Autenticando...';
        clearErro();

        try {
            const res  = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('adv_token',      data.token);
                localStorage.setItem('adv_user_nome',  data.nome);
                localStorage.setItem('adv_user_email', data.email);
                window.location.href = '/dashboard.html';
            } else {
                showErro(data.erro || 'E-mail ou senha incorretos.');
            }
        } catch {
            showErro('Erro de conexão. Tente novamente.');
        } finally {
            btn.disabled = false;
            btn.textContent = orig;
        }
    });

    function showErro(msg) {
        clearErro();
        const p = document.createElement('p');
        p.id = 'login-error';
        p.textContent = msg;
        p.style.cssText = `margin-top:.75rem;padding:.6rem 1rem;border-radius:6px;font-size:.875rem;
            font-weight:500;text-align:center;
            background:rgba(239,68,68,.15);color:#dc2626;
            border:1px solid rgba(239,68,68,.3)`;
        (document.querySelector('.login-form') || form).appendChild(p);
    }
    function clearErro() { document.getElementById('login-error')?.remove(); }
});
