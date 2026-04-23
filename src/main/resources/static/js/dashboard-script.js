document.addEventListener('DOMContentLoaded', () => {

    // ── Proteção da rota ───────────────────────────────────────────────────────
    const token = localStorage.getItem('adv_token');
    if (!token) { window.location.href = '/login.html'; return; }

    // ── Nome do admin ──────────────────────────────────────────────────────────
    const nomeEl = document.querySelector('.admin-user');
    if (nomeEl) nomeEl.textContent = localStorage.getItem('adv_user_nome') || 'Admin';

    // ── Logout ─────────────────────────────────────────────────────────────────
    document.querySelector('a[href="login.html"]')?.addEventListener('click', e => {
        e.preventDefault();
        ['adv_token','adv_user_nome','adv_user_email'].forEach(k => localStorage.removeItem(k));
        window.location.href = '/login.html';
    });

    // ── Helper de request autenticado ─────────────────────────────────────────
    const api = async (url, opts = {}) => {
        const res = await fetch(url, {
            ...opts,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, ...(opts.headers || {}) }
        });
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('adv_token');
            window.location.href = '/login.html';
            return null;
        }
        return res;
    };

    const esc = t => String(t || '').replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));

    const fmtDate = iso => {
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    };
    const fmtDateShort = iso => new Date(iso).toLocaleDateString('pt-BR');

    // ══════════════════════════════════════════════════════════════════════════
    // INJEÇÃO DO HTML DO PAINEL (tabs + seção de notícias)
    // ══════════════════════════════════════════════════════════════════════════
    const dashContainer = document.querySelector('.dashboard-container');
    if (dashContainer) {
        // Adiciona abas de navegação
        const tabsHtml = `
        <div class="dash-tabs" style="display:flex;gap:8px;margin-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:.75rem">
            <button class="tab-btn active" data-tab="contatos" style="padding:.5rem 1.25rem;border:none;cursor:pointer;border-radius:6px;font-weight:500;background:var(--accent,#c9a84c);color:#fff">📋 Contatos</button>
            <button class="tab-btn" data-tab="noticias" style="padding:.5rem 1.25rem;border:none;cursor:pointer;border-radius:6px;font-weight:500;background:transparent;color:inherit;border:1px solid rgba(255,255,255,.2)">📰 Notícias</button>
        </div>`;
        dashContainer.insertAdjacentHTML('afterbegin', tabsHtml);

        // Seção de notícias (oculta por padrão)
        dashContainer.insertAdjacentHTML('beforeend', `
        <div id="section-noticias" style="display:none">
            <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
                <h2 style="margin:0">Gerenciamento de Notícias</h2>
                <button id="btn-nova-noticia" class="btn btn-primary btn-sm">+ Nova Notícia</button>
            </header>

            <!-- Formulário de criar/editar -->
            <div id="form-noticia-wrap" style="display:none;background:rgba(255,255,255,.05);border-radius:10px;padding:1.5rem;margin-bottom:1.5rem">
                <h3 id="form-noticia-title" style="margin-top:0">Nova Notícia</h3>
                <div style="display:flex;flex-direction:column;gap:.75rem">
                    <input id="n-titulo"    placeholder="Título *" style="padding:.6rem .9rem;border-radius:6px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:inherit;font-size:.95rem"/>
                    <input id="n-categoria" placeholder="Categoria (ex: Contratos, Patrimônio...)" style="padding:.6rem .9rem;border-radius:6px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:inherit;font-size:.95rem"/>
                    <textarea id="n-conteudo" rows="6" placeholder="Conteúdo da notícia *" style="padding:.6rem .9rem;border-radius:6px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:inherit;font-size:.95rem;resize:vertical"></textarea>
                    <div style="display:flex;gap:.5rem">
                        <button id="btn-salvar-noticia" class="btn btn-primary btn-sm">Salvar</button>
                        <button id="btn-cancelar-noticia" class="btn btn-secondary btn-sm">Cancelar</button>
                    </div>
                    <p id="noticia-msg" style="margin:0;font-size:.875rem"></p>
                </div>
            </div>

            <!-- Tabela de notícias -->
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Data</th><th>Categoria</th><th>Título</th><th>Ações</th></tr></thead>
                    <tbody id="noticias-table-body"></tbody>
                </table>
            </div>
        </div>`);
    }

    // ── Navegação por abas ─────────────────────────────────────────────────────
    const sectionContatos  = document.querySelector('.dashboard-page-header')?.parentElement;
    const sectionNoticias  = document.getElementById('section-noticias');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.style.background = 'transparent';
                b.style.color = 'inherit';
                b.style.border = '1px solid rgba(255,255,255,.2)';
            });
            btn.style.background = 'var(--accent,#c9a84c)';
            btn.style.color = '#fff';
            btn.style.border = 'none';

            const tab = btn.getAttribute('data-tab');
            if (tab === 'contatos') {
                document.querySelector('.dashboard-page-header') && showSection('contatos');
            } else {
                showSection('noticias');
                carregarNoticias();
            }
        });
    });

    function showSection(tab) {
        // Contatos: tudo exceto section-noticias
        const contatosEls = dashContainer.querySelectorAll(':scope > *:not(#section-noticias):not(.dash-tabs)');
        contatosEls.forEach(el => el.style.display = tab === 'contatos' ? '' : 'none');
        if (sectionNoticias) sectionNoticias.style.display = tab === 'noticias' ? '' : 'none';
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ABA CONTATOS
    // ══════════════════════════════════════════════════════════════════════════
    let todosContatos = [];
    let filtroAtual   = 'all';

    const tableBody     = document.getElementById('leads-table-body');
    const filterBtns    = document.querySelectorAll('.filter-btn');
    const modal         = document.getElementById('details-modal');
    const modalBody     = document.getElementById('modal-body-content');
    const closeBtns     = [document.getElementById('close-modal'), document.getElementById('btn-close-modal-footer')];

    const carregarContatos = async () => {
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center">Carregando...</td></tr>`;
        const [cRes, sRes] = await Promise.all([api('/api/contatos'), api('/api/contatos/stats')]);
        if (!cRes || !sRes) return;

        todosContatos = await cRes.json();
        const stats   = await sRes.json();

        document.getElementById('count-novos')     && (document.getElementById('count-novos').textContent     = stats.pendentes ?? 0);
        document.getElementById('count-andamento') && (document.getElementById('count-andamento').textContent = stats.atendidos ?? 0);
        document.getElementById('count-total')     && (document.getElementById('count-total').textContent     = stats.total ?? 0);

        renderContatos(filtroAtual);
    };

    const renderContatos = (filtro) => {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const lista = filtro === 'all' ? todosContatos : todosContatos.filter(c => c.status === filtro);
        if (!lista.length) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted,#888)">Nenhum contato encontrado.</td></tr>`;
            return;
        }
        lista.forEach(c => {
            const data = c.dataEnvio ? fmtDate(c.dataEnvio).split(',')[0] : '—';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data}</td>
                <td><strong>${esc(c.cliente?.nome)}</strong></td>
                <td>${esc(c.cliente?.email || c.cliente?.telefone || '—')}</td>
                <td class="cell-reason" title="${esc(c.mensagem)}">${esc(c.mensagem)}</td>
                <td>
                    <select class="status-select" data-id="${c.idContato}" data-status="${c.status}">
                        <option value="pendente"  ${c.status==='pendente'  ? 'selected':''}>Pendente</option>
                        <option value="atendido"  ${c.status==='atendido'  ? 'selected':''}>Atendido</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn view-btn" data-id="${c.idContato}">Ver</button>
                    <button class="action-btn del-btn" data-id="${c.idContato}" style="margin-left:6px;background:rgba(239,68,68,.15);color:#dc2626;border-color:rgba(239,68,68,.3)">Excluir</button>
                </td>`;
            tableBody.appendChild(tr);
        });

        tableBody.querySelectorAll('.status-select').forEach(s => s.addEventListener('change', handleStatusChange));
        tableBody.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', e => abrirModal(+e.target.dataset.id)));
        tableBody.querySelectorAll('.del-btn').forEach(b => b.addEventListener('click', e => deletarContato(+e.target.dataset.id)));
    };

    const handleStatusChange = async (e) => {
        const sel = e.target, id = +sel.dataset.id, ant = sel.dataset.status;
        sel.disabled = true;
        const res = await api(`/api/contatos/${id}/status`, { method:'PATCH', body: JSON.stringify({ status: sel.value }) });
        if (res?.ok) {
            sel.dataset.status = sel.value;
            const c = todosContatos.find(x => x.idContato === id);
            if (c) c.status = sel.value;
        } else {
            sel.value = ant;
            alert('Erro ao atualizar status.');
        }
        sel.disabled = false;
    };

    const deletarContato = async (id) => {
        if (!confirm('Excluir este contato?')) return;
        const res = await api(`/api/contatos/${id}`, { method:'DELETE' });
        if (res?.ok) { todosContatos = todosContatos.filter(c => c.idContato !== id); renderContatos(filtroAtual); }
    };

    const abrirModal = (id) => {
        const c = todosContatos.find(x => x.idContato === id);
        if (!c || !modalBody) return;
        modalBody.innerHTML = `
            <div class="detail-group"><label>ID</label><p>#${c.idContato}</p></div>
            <div class="detail-group"><label>Data</label><p>${c.dataEnvio ? fmtDate(c.dataEnvio) : '—'}</p></div>
            <div class="detail-group"><label>Cliente</label><p>${esc(c.cliente?.nome)}</p></div>
            <div class="detail-group"><label>Contato</label><p>${esc(c.cliente?.email || c.cliente?.telefone || '—')}</p></div>
            <div class="detail-group"><label>Status</label><p>${c.status === 'pendente' ? 'Pendente' : 'Atendido'}</p></div>
            <div class="detail-group"><label>Mensagem</label><p>${esc(c.mensagem)}</p></div>`;
        modal?.classList.add('is-active');
    };

    filterBtns.forEach(b => b.addEventListener('click', e => {
        filterBtns.forEach(x => x.classList.remove('active'));
        e.target.classList.add('active');
        filtroAtual = e.target.dataset.filter;
        renderContatos(filtroAtual);
    }));

    closeBtns.forEach(b => b?.addEventListener('click', () => modal?.classList.remove('is-active')));
    window.addEventListener('click', e => { if (e.target === modal) modal?.classList.remove('is-active'); });

    // ══════════════════════════════════════════════════════════════════════════
    // ABA NOTÍCIAS
    // ══════════════════════════════════════════════════════════════════════════
    let editandoId = null;

    const tbNoticias = document.getElementById('noticias-table-body');
    const formWrap   = document.getElementById('form-noticia-wrap');
    const nMsg       = document.getElementById('noticia-msg');

    document.getElementById('btn-nova-noticia')?.addEventListener('click', () => {
        editandoId = null;
        document.getElementById('form-noticia-title').textContent = 'Nova Notícia';
        document.getElementById('n-titulo').value    = '';
        document.getElementById('n-categoria').value = '';
        document.getElementById('n-conteudo').value  = '';
        if (nMsg) nMsg.textContent = '';
        formWrap.style.display = '';
    });

    document.getElementById('btn-cancelar-noticia')?.addEventListener('click', () => {
        formWrap.style.display = 'none';
        editandoId = null;
    });

    document.getElementById('btn-salvar-noticia')?.addEventListener('click', async () => {
        const titulo    = document.getElementById('n-titulo').value.trim();
        const categoria = document.getElementById('n-categoria').value.trim();
        const conteudo  = document.getElementById('n-conteudo').value.trim();

        if (!titulo || !conteudo) { if (nMsg) { nMsg.textContent = 'Título e conteúdo são obrigatórios.'; nMsg.style.color = '#dc2626'; } return; }

        const body = JSON.stringify({ titulo, categoria, conteudo });
        const res  = editandoId
            ? await api(`/api/noticias/${editandoId}`, { method:'PUT', body })
            : await api('/api/noticias', { method:'POST', body });

        if (res?.ok) {
            if (nMsg) { nMsg.textContent = editandoId ? 'Notícia atualizada!' : 'Notícia publicada!'; nMsg.style.color = '#16a34a'; }
            formWrap.style.display = 'none';
            editandoId = null;
            carregarNoticias();
        } else {
            if (nMsg) { nMsg.textContent = 'Erro ao salvar. Tente novamente.'; nMsg.style.color = '#dc2626'; }
        }
    });

    const carregarNoticias = async () => {
        if (tbNoticias) tbNoticias.innerHTML = `<tr><td colspan="4" style="text-align:center">Carregando...</td></tr>`;
        const res = await api('/api/noticias');
        if (!res) return;
        const lista = await res.json();
        if (!tbNoticias) return;
        tbNoticias.innerHTML = '';
        if (!lista.length) {
            tbNoticias.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888">Nenhuma notícia publicada.</td></tr>`;
            return;
        }
        lista.forEach(n => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${fmtDateShort(n.dataPublicacao)}</td>
                <td>${esc(n.categoria || 'Geral')}</td>
                <td><strong>${esc(n.titulo)}</strong></td>
                <td>
                    <button class="action-btn edit-n-btn" data-id="${n.idNoticia}">Editar</button>
                    <button class="action-btn del-n-btn" data-id="${n.idNoticia}" style="margin-left:6px;background:rgba(239,68,68,.15);color:#dc2626;border-color:rgba(239,68,68,.3)">Excluir</button>
                </td>`;
            tbNoticias.appendChild(tr);
        });

        tbNoticias.querySelectorAll('.edit-n-btn').forEach(b => b.addEventListener('click', async e => {
            const id  = +e.target.dataset.id;
            const res = await api(`/api/noticias/${id}`); // busca via rota pública
            if (!res) return;
            const n = await (await fetch(`/api/noticias/publicas/${id}`)).json();
            editandoId = id;
            document.getElementById('form-noticia-title').textContent = 'Editar Notícia';
            document.getElementById('n-titulo').value    = n.titulo || '';
            document.getElementById('n-categoria').value = n.categoria || '';
            document.getElementById('n-conteudo').value  = n.conteudo || '';
            if (nMsg) nMsg.textContent = '';
            formWrap.style.display = '';
        }));

        tbNoticias.querySelectorAll('.del-n-btn').forEach(b => b.addEventListener('click', async e => {
            if (!confirm('Excluir esta notícia?')) return;
            const res = await api(`/api/noticias/${+e.target.dataset.id}`, { method:'DELETE' });
            if (res?.ok) carregarNoticias();
        }));
    };

    // ── Inicializa ─────────────────────────────────────────────────────────────
    carregarContatos();
    setInterval(carregarContatos, 30000);
});
