// noticias.js — Carrega artigos publicados via API e renderiza no grid
document.addEventListener('DOMContentLoaded', async () => {

    const grid    = document.getElementById('articles-grid');
    const loading = document.getElementById('articles-loading');

    // Artigos de fallback (exibidos enquanto a API não responde ou está vazia)
    const FALLBACK_ARTICLES = [
        {
            titulo: 'Acordo de sócios: o que precisa constar para evitar conflitos futuros?',
            categoria: 'Direito Empresarial',
            dataPublicacao: '2025-04-01T00:00:00',
            resumo: 'Um acordo de sócios bem redigido é um dos instrumentos mais importantes para a saúde de qualquer sociedade. Define regras claras sobre tomada de decisões, divisão de lucros e saída de sócios.',
            slug: null,
            featured: true
        },
        {
            titulo: 'Compra de imóvel em Brasília: os 5 documentos que você precisa verificar antes de assinar.',
            categoria: 'Direito Imobiliário',
            dataPublicacao: '2025-03-01T00:00:00',
            resumo: 'Comprar um imóvel é uma das decisões financeiras mais relevantes da vida. Muitas pessoas assinam contratos sem verificar documentos essenciais.',
            slug: null
        },
        {
            titulo: 'Holding familiar: como organizar o patrimônio e facilitar a herança.',
            categoria: 'Família e Sucessões',
            dataPublicacao: '2025-03-10T00:00:00',
            resumo: 'Estruturar uma holding familiar é uma das estratégias mais eficientes para proteger bens, reduzir a carga tributária e evitar conflitos no inventário.',
            slug: null
        }
    ];

    function formatarData(isoString) {
        if (!isoString) return '';
        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                        'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const d = new Date(isoString);
        return `${meses[d.getMonth()]} ${d.getFullYear()}`;
    }

    function buildCard(artigo, index) {
        const isFirst   = index === 0;
        const cardClass = isFirst ? 'article-card article-featured reveal' : 'article-card reveal';
        const headingTag = isFirst ? 'h2' : 'h3';
        const linkHref = artigo.slug
            ? `noticias.html#${artigo.slug}`
            : 'index.html#contato';
        const linkText = isFirst
            ? 'Agendar consulta sobre esse tema <span aria-hidden="true">→</span>'
            : 'Tirar dúvida com o Dr. Vitor <span aria-hidden="true">→</span>';

        return `
        <article class="${cardClass}">
            <div class="article-meta">
                <span class="article-cat">${artigo.categoria || 'Jurídico'}</span>
                <span class="article-sep">·</span>
                <span class="article-date">${formatarData(artigo.dataPublicacao)}</span>
            </div>
            <${headingTag}>${artigo.titulo}</${headingTag}>
            <p>${artigo.resumo || artigo.conteudo?.substring(0, 200) || ''}</p>
            <a href="${linkHref}" class="card-link">${linkText}</a>
        </article>`;
    }

    function renderArticles(articles) {
        if (!articles || articles.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-soft); text-align:center; padding:3rem 0;">Nenhum artigo publicado no momento.</p>';
            return;
        }

        grid.innerHTML = articles.map((a, i) => buildCard(a, i)).join('');

        // Reativa o observer de reveal para os novos elementos
        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries, o) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        o.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
            grid.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        } else {
            grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        }
    }

    // Tenta buscar da API; se falhar usa o fallback
    try {
        const response = await fetch('/api/news', { method: 'GET' });
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                renderArticles(data);
            } else {
                // API respondeu mas sem artigos publicados — usa fallback
                renderArticles(FALLBACK_ARTICLES);
            }
        } else {
            renderArticles(FALLBACK_ARTICLES);
        }
    } catch (err) {
        // API inacessível (desenvolvimento sem backend) — usa fallback
        console.warn('[noticias.js] API indisponível, usando artigos de fallback.', err);
        renderArticles(FALLBACK_ARTICLES);
    }
});
