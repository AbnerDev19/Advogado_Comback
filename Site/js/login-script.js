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
                // Chamada real para a API Spring Boot (que criaremos em breve)
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, senha: password })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Guarda o token JWT no navegador para usar nas próximas requisições
                    if (data.token) {
                        localStorage.setItem('vr_jwt_token', data.token);
                    }
                    
                    // Redireciona para o painel
                    window.location.href = 'dashboard.html';
                } else {
                    throw new Error('Falha na autenticação');
                }
            } catch (error) {
                console.error('Erro na API de login:', error);

                // =========================================================
                // BYPASS TEMPORÁRIO (Remover após configurar o Spring Security)
                // Permite entrar usando as credenciais do README
                // =========================================================
                if (email === 'admin@vitorrochaadv.com.br' && password === 'admin123') {
                    console.warn('Aviso: Entrando via Bypass Temporário.');
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Erro no acesso: Email ou senha incorretos.');
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            }
        });
    }
});