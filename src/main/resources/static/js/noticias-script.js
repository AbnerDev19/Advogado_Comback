// Carrega notícias da API pública e renderiza na página noticias.html
document.addEventListener('DOMContentLoaded', async () => {

    const grid = document.getElementById('news-grid');
    if (!grid) return;

    try {
        const res   = await fetch('/api/noticias/publicas');
        const lista = await res.json();

        if (!lista || lista.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--text-muted,#888)">
                    <p>Nenhuma notícia publicada ainda.</p>
                    <p style="font-size:.875rem;margin-top:.5rem">Acesse o painel administrativo para publicar conteúdo.</p>
                </div>`;
            return;
        }

        const esc = t => String(t || '').replace(/[&<>"']/g, m =>
            ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));

        const fmtDate = iso => new Date(iso).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        // Primeira notícia = destaque
        const [destaque, ...resto] = lista;

        const resumo = txt => txt && txt.length > 200 ? txt.substring(0, 200) + '…' : txt;

        let html = `
            <article class="news-post news-post-featured reveal-on-scroll">
                <span class="news-category">${esc(destaque.categoria || 'Destaque')}</span>
                <h2>${esc(destaque.titulo)}</h2>
                <p>${esc(resumo(destaque.conteudo))}</p>
                <small style="color:var(--text-muted,#888);font-size:.8rem">${fmtDate(destaque.dataPublicacao)}</small>
            </article>`;

        resto.forEach(n => {
            html += `
            <article class="news-post reveal-on-scroll">
                <span class="news-category">${esc(n.categoria || 'Geral')}</span>
                <h3>${esc(n.titulo)}</h3>
                <p>${esc(resumo(n.conteudo))}</p>
                <small style="color:var(--text-muted,#888);font-size:.8rem">${fmtDate(n.dataPublicacao)}</small>
            </article>`;
        });

        grid.innerHTML = html;

        // Ativa reveal nas novas notícias
        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries, o) => {
                entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); o.unobserve(e.target); } });
            }, { threshold: 0.1 });
            grid.querySelectorAll('.reveal-on-scroll').forEach(el => obs.observe(el));
        } else {
            grid.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'));
        }

    } catch (err) {
        console.error('Erro ao carregar notícias:', err);
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:2rem;color:#dc2626">
                Não foi possível carregar as notícias. Verifique a conexão.
            </div>`;
    }
});
