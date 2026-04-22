document.addEventListener('DOMContentLoaded', () => {

    // ══════════════════════════════════════════════
    // AUTENTICAÇÃO — protege o painel
    // ══════════════════════════════════════════════
    const token = localStorage.getItem('adv_token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Preenche o nome do usuário logado
    const nomeUsuario = localStorage.getItem('adv_user_nome') || 'Administrador';
    const adminUserEl = document.querySelector('.admin-user');
    if (adminUserEl) adminUserEl.textContent = nomeUsuario;

    // Botão de sair
    const sairBtn = document.querySelector('a[href="login.html"]');
    if (sairBtn) {
        sairBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('adv_token');
            localStorage.removeItem('adv_user_nome');
            localStorage.removeItem('adv_user_email');
            window.location.href = '/login.html';
        });
    }

    // Helper para requests autenticados
    const apiRequest = async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            ...(options.headers || {})
        };
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('adv_token');
            window.location.href = '/login.html';
            return null;
        }
        return response;
    };

    // ══════════════════════════════════════════════
    // ESTADO LOCAL
    // ══════════════════════════════════════════════
    let allLeads     = [];
    let filtroAtual  = 'all';

    // ── Elementos DOM ─────────────────────────────
    const tableBody      = document.getElementById('leads-table-body');
    const filterButtons  = document.querySelectorAll('.filter-btn');
    const modal          = document.getElementById('details-modal');
    const closeModalBtn  = document.getElementById('close-modal');
    const closeModalFBtn = document.getElementById('btn-close-modal-footer');
    const modalBody      = document.getElementById('modal-body-content');

    // ── Formata data ISO → pt-BR ──────────────────
    const formatDate = (iso) => {
        const date = new Date(iso);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // ── Labels de status ──────────────────────────
    const statusLabel = {
        'novo_contato':  'Novo',
        'em_andamento':  'Em Andamento',
        'concluido':     'Concluído'
    };

    // ══════════════════════════════════════════════
    // CARREGA DADOS DO BACKEND
    // ══════════════════════════════════════════════
    const carregarLeads = async () => {
        setTableLoading(true);
        try {
            const [leadsRes, statsRes] = await Promise.all([
                apiRequest('/api/leads'),
                apiRequest('/api/leads/stats')
            ]);

            if (!leadsRes || !statsRes) return;

            allLeads = await leadsRes.json();
            const stats = await statsRes.json();

            // Atualiza os contadores
            document.getElementById('count-novos').textContent     = stats.novos     ?? 0;
            document.getElementById('count-andamento').textContent = stats.em_andamento ?? 0;
            document.getElementById('count-total').textContent     = stats.total      ?? 0;

            renderTable(filtroAtual);

        } catch (err) {
            console.error('Erro ao carregar leads:', err);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">
                Erro ao conectar com o servidor. Tente recarregar a página.
            </td></tr>`;
        } finally {
            setTableLoading(false);
        }
    };

    // ══════════════════════════════════════════════
    // RENDERIZA TABELA
    // ══════════════════════════════════════════════
    const renderTable = (filtro = 'all') => {
        tableBody.innerHTML = '';

        const lista = filtro === 'all'
            ? allLeads
            : allLeads.filter(l => l.status === filtro);

        if (lista.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">
                Nenhum contato encontrado.
            </td></tr>`;
            return;
        }

        lista.forEach(lead => {
            const tr = document.createElement('tr');
            const dataFormatada = lead.dataRegistro ? formatDate(lead.dataRegistro) : '—';

            tr.innerHTML = `
                <td>${dataFormatada.split(',')[0]}</td>
                <td><strong>${escapeHtml(lead.nome)}</strong></td>
                <td>${escapeHtml(lead.contato)}</td>
                <td class="cell-reason" title="${escapeHtml(lead.motivo)}">${escapeHtml(lead.motivo)}</td>
                <td>
                    <select class="status-select" data-id="${lead.id}" data-status="${lead.status}">
                        <option value="novo_contato"  ${lead.status === 'novo_contato'  ? 'selected' : ''}>Novo</option>
                        <option value="em_andamento"  ${lead.status === 'em_andamento'  ? 'selected' : ''}>Em Andamento</option>
                        <option value="concluido"     ${lead.status === 'concluido'     ? 'selected' : ''}>Concluído</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn view-details-btn" data-id="${lead.id}">Ver Detalhes</button>
                    <button class="action-btn delete-btn" data-id="${lead.id}" style="margin-left:6px;background:rgba(239,68,68,0.15);color:#dc2626;border-color:rgba(239,68,68,0.3)">Excluir</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Eventos de status
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', handleStatusChange);
        });

        // Eventos de detalhes
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(+e.target.getAttribute('data-id')));
        });

        // Eventos de exclusão
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleDelete(+e.target.getAttribute('data-id')));
        });
    };

    // ══════════════════════════════════════════════
    // ATUALIZAR STATUS (API)
    // ══════════════════════════════════════════════
    const handleStatusChange = async (e) => {
        const select    = e.target;
        const id        = +select.getAttribute('data-id');
        const novoStatus = select.value;
        const anteriorStatus = select.getAttribute('data-status');

        select.disabled = true;

        try {
            const res = await apiRequest(`/api/leads/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: novoStatus })
            });

            if (res && res.ok) {
                select.setAttribute('data-status', novoStatus);
                // Atualiza no array local
                const lead = allLeads.find(l => l.id === id);
                if (lead) lead.status = novoStatus;
                // Atualiza stats localmente
                atualizarStats();
            } else {
                select.value = anteriorStatus;
                alert('Erro ao atualizar status. Tente novamente.');
            }
        } catch (err) {
            select.value = anteriorStatus;
            console.error('Erro ao atualizar status:', err);
        } finally {
            select.disabled = false;
        }
    };

    // ══════════════════════════════════════════════
    // EXCLUIR LEAD (API)
    // ══════════════════════════════════════════════
    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este contato? Essa ação não pode ser desfeita.')) return;

        try {
            const res = await apiRequest(`/api/leads/${id}`, { method: 'DELETE' });
            if (res && res.ok) {
                allLeads = allLeads.filter(l => l.id !== id);
                atualizarStats();
                renderTable(filtroAtual);
            } else {
                alert('Erro ao excluir. Tente novamente.');
            }
        } catch (err) {
            console.error('Erro ao excluir lead:', err);
        }
    };

    // ── Recalcula stats localmente ────────────────
    const atualizarStats = () => {
        const novos     = allLeads.filter(l => l.status === 'novo_contato').length;
        const andamento = allLeads.filter(l => l.status === 'em_andamento').length;

        document.getElementById('count-novos').textContent     = novos;
        document.getElementById('count-andamento').textContent = andamento;
        document.getElementById('count-total').textContent     = allLeads.length;
    };

    // ══════════════════════════════════════════════
    // FILTROS
    // ══════════════════════════════════════════════
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filtroAtual = e.target.getAttribute('data-filter');
            renderTable(filtroAtual);
        });
    });

    // ══════════════════════════════════════════════
    // MODAL DE DETALHES
    // ══════════════════════════════════════════════
    const openModal = (id) => {
        const lead = allLeads.find(l => l.id === id);
        if (!lead) return;

        modalBody.innerHTML = `
            <div class="detail-group">
                <label>ID da Solicitação</label>
                <p>#${lead.id}</p>
            </div>
            <div class="detail-group">
                <label>Data de Registro</label>
                <p>${lead.dataRegistro ? formatDate(lead.dataRegistro) : '—'}</p>
            </div>
            <div class="detail-group">
                <label>Nome Completo</label>
                <p>${escapeHtml(lead.nome)}</p>
            </div>
            <div class="detail-group">
                <label>Contato</label>
                <p>${escapeHtml(lead.contato)}</p>
            </div>
            <div class="detail-group">
                <label>Status</label>
                <p>${statusLabel[lead.status] || lead.status}</p>
            </div>
            <div class="detail-group">
                <label>Motivo / Resumo do Caso</label>
                <p>${escapeHtml(lead.motivo)}</p>
            </div>
        `;
        modal.classList.add('is-active');
    };

    const closeModal = () => modal.classList.remove('is-active');
    closeModalBtn.addEventListener('click', closeModal);
    closeModalFBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // ══════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════
    function setTableLoading(isLoading) {
        if (isLoading) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem">
                Carregando contatos...
            </td></tr>`;
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // ── Inicializa ────────────────────────────────
    carregarLeads();

    // Atualiza os leads a cada 30 segundos
    setInterval(carregarLeads, 30000);
});
