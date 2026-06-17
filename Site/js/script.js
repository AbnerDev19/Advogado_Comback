document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.getElementById('main-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

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

  const themeBtn = document.getElementById('theme-toggle');
  const root     = document.documentElement;
  if (themeBtn) {
    const saved = localStorage.getItem('vr_theme');
    if (saved === 'light') {
        root.setAttribute('data-theme', 'light');
    } else {
        root.removeAttribute('data-theme');
    }
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

  const form      = document.getElementById('lead-form');
  const submitBtn = document.getElementById('submit-btn');
  const successEl = document.getElementById('form-success');

  if (form) {
    function validateField(input, errorId) {
      const group = input.closest('.form-group');
      const error = document.getElementById(errorId);
      const valid = input.value.trim().length > 0;
      group.classList.toggle('has-error', !valid);
      if (error) error.style.display = valid ? 'none' : 'block';
      return valid;
    }

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

      const v1 = validateField(nameInput, 'error-name');
      const v2 = validateField(contactInput, 'error-contact');
      const v3 = validateField(reasonInput, 'error-reason');
      if (!v1 || !v2 || !v3) return;

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      const leadData = {
        nome:        nameInput.value.trim(),
        contato:     contactInput.value.trim(),
        area:        areaInput ? areaInput.value : '',
        motivo:      reasonInput.value.trim(),
        status:      'novo_contato',
        origem:      'formulario_site'
      };
      
      try {
        const response = await fetch(`${window.API_BASE_URL}/api/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });

        if (response.ok) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            form.reset();

            form.querySelectorAll('.form-group, .form-privacy, #submit-btn').forEach(el => {
                el.style.display = 'none';
            });
            if (successEl) successEl.classList.add('visible');
        } else {
            throw new Error("Erro na resposta da API");
        }
      } catch (error) {
          console.error("Erro ao enviar contato:", error);
          alert("Não foi possível enviar a mensagem no momento. Tente novamente.");
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
      }
    });
  }

  const articlesGrid = document.getElementById('articles-grid');
  
  if (articlesGrid) {
    async function carregarNoticiasPublicas() {
      try {
        const response = await fetch(`${window.API_BASE_URL}/api/news`);
        if (response.ok) {
          const noticias = await response.json();
          const publicadas = noticias
                .filter(n => n.status === 'Publicado')
                .sort((a,b) => new Date(b.dataPublicacao) - new Date(a.dataPublicacao));
          
          if (publicadas.length > 0) {
            articlesGrid.innerHTML = ''; 
            
            publicadas.forEach((news, index) => {
              const isFeatured = index === 0 ? 'article-featured' : '';
              const dataFormatada = new Date(news.dataPublicacao).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
              
              const articleHTML = `
                <article class="article-card ${isFeatured} reveal visible">
                  <div class="article-meta">
                    <span class="article-cat">${news.categoria}</span>
                    <span class="article-sep">·</span>
                    <span class="article-date">${dataFormatada}</span>
                  </div>
                  <h2>${news.titulo}</h2>
                  <div class="news-resumo-box"><p>${news.resumo}</p></div>
                  <div class="news-conteudo-box" style="display: none; white-space: pre-wrap; font-size: 0.95rem; color: var(--text-soft); line-height: 1.8; margin-top: 15px;">${news.conteudo}</div>
                  <button class="card-link" onclick="toggleLeiaMais(this)" style="background:none; border:none; padding:0; cursor:pointer; font-size:1rem; font-family:var(--font-body); margin-top:16px;">
                    Ler artigo completo <span aria-hidden="true">→</span>
                  </button>
                </article>
              `;
              articlesGrid.insertAdjacentHTML('beforeend', articleHTML);
            });
          }
        }
      } catch (error) {
        console.error("Erro ao buscar notícias do banco:", error);
      }
    }
    carregarNoticiasPublicas();
  }
});

window.toggleLeiaMais = function(btn) {
  const article = btn.closest('.article-card');
  const resumo = article.querySelector('.news-resumo-box');
  const conteudo = article.querySelector('.news-conteudo-box');
  
  if (conteudo.style.display === 'none') {
    conteudo.style.display = 'block';
    resumo.style.display = 'none';
    btn.innerHTML = 'Recolher artigo <span aria-hidden="true">↑</span>';
  } else {
    conteudo.style.display = 'none';
    resumo.style.display = 'block';
    btn.innerHTML = 'Ler artigo completo <span aria-hidden="true">→</span>';
  }
};