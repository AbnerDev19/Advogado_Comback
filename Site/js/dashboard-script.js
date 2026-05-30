// ==========================================
// FUNÇÕES GLOBAIS (Abas e Modais)
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.querySelector(`button[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('is-active');
}

// Fechar modais ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// ==========================================
// LÓGICA DO DASHBOARD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. MÓDULO: CONTATOS (LEADS)
    // ==========================================
    let mockLeads = []; // Os dados vêm da API
    let currentOpenLeadId = null;

    // Função auxiliar para criar o cabeçalho com o Token
    function getAuthHeaders() {
        const token = localStorage.getItem('vr_jwt_token');
        if (!token) {
            // Se não tiver token, expulsa de volta para o login
            window.location.href = 'login.html'; 
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
    }

    // --- BUSCAR LEADS DO BANCO DE DADOS ---
    async function carregarLeads() {
        try {
            const response = await fetch('/api/leads', {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                
                // Mapeia os dados da API para o frontend
                mockLeads = data.map(lead => ({
                    ...lead,
                    data_registro: lead.dataCriacao,
                    // CORREÇÃO: Agora puxamos as notas que vêm da API. Se não houver, fica array vazio.
                    notas: lead.notas || [] 
                }));

                updateLeadStats();
                const filtroAtivo = document.querySelector('.filter-btn.active');
                renderLeadsTable(filtroAtivo ? filtroAtivo.getAttribute('data-filter') : 'all');
            }
        } catch (error) {
            console.error("Erro ao carregar leads da API:", error);
        }
    }

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    };

    const updateLeadStats = () => {
        document.getElementById('count-novos').textContent = mockLeads.filter(l => l.status === 'novo_contato').length;
        document.getElementById('count-andamento').textContent = mockLeads.filter(l => l.status === 'em_andamento').length;
        document.getElementById('count-total').textContent = mockLeads.filter(l => l.status !== 'arquivado').length; 
    };

    const renderLeadsTable = (filterStatus = 'all') => {
        const leadsTableBody = document.getElementById('leads-table-body');
        leadsTableBody.innerHTML = '';
        
        let filtered = filterStatus === 'all' 
            ? mockLeads.filter(l => l.status !== 'arquivado') 
            : mockLeads.filter(l => l.status === filterStatus);

        if (filtered.length === 0) {
            leadsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhum contato encontrado no banco de dados.</td></tr>`;
            return;
        }

        // Ordena do mais recente para o mais antigo
        filtered.sort((a, b) => new Date(b.data_registro) - new Date(a.data_registro));

        filtered.forEach(lead => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(lead.data_registro).split(',')[0]}</td>
                <td><strong>${lead.nome}</strong></td>
                <td>${lead.contato}</td>
                <td class="cell-reason" title="${lead.motivo}">${lead.motivo}</td>
                <td>
                    <select class="status-select" data-id="${lead.id}" data-status="${lead.status}">
                        <option value="novo_contato" ${lead.status === 'novo_contato' ? 'selected' : ''}>Novo</option>
                        <option value="em_andamento" ${lead.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                        <option value="concluido" ${lead.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                        <option value="arquivado" ${lead.status === 'arquivado' ? 'selected' : ''}>Arquivado</option>
                    </select>
                </td>
                <td><button class="action-btn" onclick="openLeadDetails('${lead.id}')">Gerenciar</button></td>
            `;
            leadsTableBody.appendChild(tr);
        });

        // --- ATUALIZAR STATUS NO BANCO DE DADOS ---
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const newStatus = e.target.value;
                const leadId = e.target.getAttribute('data-id');
                
                try {
                    await fetch(`/api/leads/${leadId}/status`, {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ status: newStatus })
                    });
                    carregarLeads(); // Recarrega os dados fresquinhos do banco
                } catch (error) {
                    console.error("Erro ao atualizar status:", error);
                }
            });
        });
    };

    // Filtros visuais
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderLeadsTable(e.target.getAttribute('data-filter'));
        });
    });

    window.openLeadDetails = (id) => {
        currentOpenLeadId = id;
        const lead = mockLeads.find(l => l.id == id);
        if(!lead) return;
        
        const statusMap = { 'novo_contato': 'Novo Contato', 'em_andamento': 'Em Andamento', 'concluido': 'Concluído', 'arquivado': 'Arquivado' };
        
        document.getElementById('modal-body-content').innerHTML = `
            <div class="detail-group"><label>Data de Registro</label><p>${formatDate(lead.data_registro)}</p></div>
            <div class="detail-group"><label>Nome do Cliente</label><p>${lead.nome}</p></div>
            <div class="detail-group"><label>Contato</label><p>${lead.contato}</p></div>
            <div class="detail-group"><label>Status Atual</label><p>${statusMap[lead.status]}</p></div>
            <div class="detail-group"><label>Solicitação Original</label><p>${lead.motivo}</p></div>
        `;

        document.getElementById('btn-archive-lead').onclick = () => archiveLead(id);
        document.getElementById('btn-delete-lead').onclick = () => deleteLeadPermanently(id);

        renderLeadNotes();
        document.getElementById('details-modal').classList.add('is-active');
    };

    const renderLeadNotes = () => {
        const lead = mockLeads.find(l => l.id == currentOpenLeadId);
        const notesContainer = document.getElementById('lead-notes-list');
        
        if (!lead.notas || lead.notas.length === 0) {
            notesContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">Nenhuma nota adicionada.</p>';
            return;
        }

        notesContainer.innerHTML = lead.notas.map(nota => `
            <div class="note-item">
                <div class="note-meta">
                    <span>Admin</span>
                    <span>${formatDate(nota.data)}</span>
                </div>
                <p class="note-text">${nota.texto}</p>
            </div>
        `).join('');
    };

    // --- CORREÇÃO: ADICIONAR NOTA REAL NO BANCO DE DADOS ---
    window.addLeadNote = async () => {
        const input = document.getElementById('new-note-text');
        const text = input.value.trim();
        
        if (text && currentOpenLeadId) {
            try {
                const response = await fetch(`/api/leads/${currentOpenLeadId}/notas`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ texto: text })
                });

                if (response.ok) {
                    input.value = '';
                    await carregarLeads(); // Puxa os dados atualizados da API
                    
                    // Atualiza o ID atual e recarrega as notas na tela
                    const leadAtualizado = mockLeads.find(l => l.id == currentOpenLeadId);
                    currentOpenLeadId = leadAtualizado.id;
                    renderLeadNotes();
                } else {
                    alert("Erro ao salvar a nota.");
                }
            } catch (error) {
                console.error("Erro ao adicionar nota:", error);
            }
        }
    };

    // --- ARQUIVAR LEAD NO BANCO ---
    window.archiveLead = async (id) => {
        try {
            await fetch(`/api/leads/${id}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: 'arquivado' })
            });
            closeModal('details-modal');
            carregarLeads();
        } catch (error) {
            console.error("Erro ao arquivar:", error);
        }
    };

    // --- DELETAR LEAD DO BANCO ---
    window.deleteLeadPermanently = async (id) => {
        if (confirm('ATENÇÃO: A exclusão apagará o lead do banco de dados definitivamente. Deseja continuar?')) {
            try {
                await fetch(`/api/leads/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                closeModal('details-modal');
                carregarLeads();
            } catch (error) {
                console.error("Erro ao deletar:", error);
            }
        }
    };

    // ==========================================
    // 2. MÓDULO: PUBLICAÇÕES E NOTÍCIAS
    // ==========================================
    let mockNews = [];

    // --- BUSCAR NOTÍCIAS DO BANCO DE DADOS ---
    async function carregarNoticias() {
        try {
            const response = await fetch('/api/news/admin', {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if(response.ok) {
                mockNews = await response.json();
                renderNewsTable();
            }
        } catch (error) {
            console.error("Erro ao carregar notícias:", error);
        }
    }

    const newsTableBody = document.getElementById('news-table-body');

    window.renderNewsTable = () => {
        newsTableBody.innerHTML = '';
        if (mockNews.length === 0) {
            newsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nenhuma notícia cadastrada no banco.</td></tr>`;
            return;
        }

        mockNews.forEach(news => {
            const tr = document.createElement('tr');
            const badgeClass = news.status === 'Publicado' ? 'publicado' : 'rascunho';
            
            tr.innerHTML = `
                <td>${formatDate(news.dataPublicacao).split(',')[0]}</td>
                <td>
                    <strong>${news.titulo}</strong><br>
                    <small style="color:var(--text-muted); font-family:monospace;">/${news.slug}</small>
                </td>
                <td>${news.categoria}</td>
                <td><span class="status-badge ${badgeClass}">${news.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="openNewsModal(${news.id})">Editar</button>
                    <button class="action-btn delete-btn" onclick="deleteNews(${news.id})">Excluir</button>
                </td>
            `;
            newsTableBody.appendChild(tr);
        });
    };

    window.openNewsModal = (id = null) => {
        const modal = document.getElementById('news-modal');
        const form = document.getElementById('news-form');
        
        if (id) {
            const news = mockNews.find(n => n.id == id);
            document.getElementById('news-modal-title').textContent = 'Editar Notícia';
            document.getElementById('news-id').value = news.id;
            document.getElementById('news-title').value = news.titulo;
            document.getElementById('news-slug').value = news.slug;
            document.getElementById('news-category').value = news.categoria;
            document.getElementById('news-status').value = news.status;
            document.getElementById('news-summary').value = news.resumo;
            document.getElementById('news-content').value = news.conteudo;
        } else {
            form.reset();
            document.getElementById('news-modal-title').textContent = 'Nova Notícia';
            document.getElementById('news-id').value = '';
        }
        
        modal.classList.add('is-active');
    };

    document.getElementById('news-title')?.addEventListener('blur', (e) => {
        const slugInput = document.getElementById('news-slug');
        if (!slugInput.value && e.target.value) {
            slugInput.value = e.target.value.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
    });

    // --- SALVAR OU ATUALIZAR NOTÍCIA NO BANCO ---
    window.saveNews = async (event) => {
        event.preventDefault();
        
        const id = document.getElementById('news-id').value;
        const payload = {
            titulo: document.getElementById('news-title').value,
            slug: document.getElementById('news-slug').value,
            categoria: document.getElementById('news-category').value,
            status: document.getElementById('news-status').value,
            resumo: document.getElementById('news-summary').value,
            conteudo: document.getElementById('news-content').value
        };

        try {
            if (id) {
                // Atualizar existente
                await fetch(`/api/news/${id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
            } else {
                // Criar nova
                await fetch(`/api/news`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
            }
            closeModal('news-modal');
            carregarNoticias(); // Recarrega a tabela com dados reais
        } catch (error) {
            console.error("Erro ao salvar notícia:", error);
        }
    };

    // --- DELETAR NOTÍCIA DO BANCO ---
    window.deleteNews = async (id) => {
        if(confirm('Tem certeza que deseja excluir esta publicação do banco de dados permanentemente?')) {
            try {
                await fetch(`/api/news/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                carregarNoticias();
            } catch (error) {
                console.error("Erro ao deletar notícia:", error);
            }
        }
    };

    // ==========================================
    // 3. MÓDULO: STATS (cards do topo)
    // ==========================================
    async function carregarStats() {
        try {
            const response = await fetch('/api/leads/stats', {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const stats = await response.json();
                const el = (id) => document.getElementById(id);
                if (el('count-novos'))     el('count-novos').textContent     = stats.novo_contato ?? 0;
                if (el('count-andamento')) el('count-andamento').textContent = stats.em_andamento ?? 0;
                if (el('count-total'))     el('count-total').textContent     = stats.total ?? 0;
            }
        } catch (error) {
            console.error('Erro ao carregar stats:', error);
        }
    }

    // ==========================================
    // 4. LOGOUT
    // ==========================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('vr_jwt_token');
            window.location.href = 'login.html';
        });
    }

    // === INICIALIZAÇÃO GERAL DO DASHBOARD ===
    carregarLeads();
    carregarNoticias();
    carregarStats();
});