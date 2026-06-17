document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const btn = loginForm.querySelector('button');
            const originalText = btn.textContent;
            
            btn.disabled = true;
            btn.textContent = 'Autenticando...';

            try {
                const response = await fetch(`${window.API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, senha: password })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.token) {
                        localStorage.setItem('vr_jwt_token', data.token);
                    }
                    window.location.href = 'dashboard.html';
                } else {
                    throw new Error('Falha na autenticação');
                }
            } catch (error) {
                console.error('Erro na API de login:', error);
                alert('Erro no acesso: Email ou senha incorretos ou servidor offline.');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }
});