document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Log técnico para desenvolvimento
            console.log('Tentativa de login:', email);

            /* Integração futura com Firebase:
               auth.signInWithEmailAndPassword(email, password)
               .then((userCredential) => {
                   window.location.href = 'dashboard.html';
               })
               .catch((error) => {
                   alert('Erro no acesso: Verificar credenciais.');
               });
            */

            // Simulação de feedback visual
            const btn = loginForm.querySelector('button');
            const originalText = btn.textContent;
            
            btn.disabled = true;
            btn.textContent = 'Autenticando...';

            setTimeout(() => {
                alert('Módulo de autenticação pronto para integração com Firebase.');
                btn.disabled = false;
                btn.textContent = originalText;
            }, 1000);
        });
    }
});