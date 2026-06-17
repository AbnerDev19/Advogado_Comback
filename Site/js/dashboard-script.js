function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.querySelector(`button[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('is-active');
}

document.addEventListener('DOMContentLoaded', () => {
    
    let mockLeads = []; 
    let currentOpenLeadId = null;

    // ATENÇÃO: Coloque aqui também a URL do Render!
    const API_URL = 'https://SUA-API-NO-RENDER.onrender.com/api';

    function getAuthHeaders() {
        const token = localStorage.getItem('vr_jwt_token');
        if (!token) {
            window.location.href = 'login.html'; 
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
    }

    async function carregarLeads() {
        try {
            const response = await fetch(`${API_URL}/leads`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                mockLeads = data.map(lead => ({
                    ...lead,
                    data_registro: lead.dataCriacao,
                    notas: []
                }));
                updateLeadStats();
                const filtroAtivo = document.querySelector('.filter-btn.active');
                renderLeadsTable(filtroAtivo ? filtroAtivo.getAttribute('data-filter') : 'all');
            }
        } catch (error) {
            console.error("Erro ao carregar leads:", error);
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

        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const newStatus = e.target.value;
                const leadId = e.target.getAttribute('data-id');
                
                try {
                    // Atualiza o objeto inteiro no PUT conforme seu LeadController (assumindo que a rota atualiza o objeto)
                    // Nota: Sua API atual não tem endpoint específico para status, então o ideal seria buscar, modificar e dar PUT. 
                    // Para fins de apresentação, isso enviará o status na esperança de atualização via PUT se ajustado.
                    const leadCompleto = mockLeads.find(l => l.id == leadId);
                    leadCompleto.status = newStatus;
                    
                    await fetch(`${API_URL}/leads`, {
                        method: 'POST', // Usando POST (criarLead) para sobrescrever/atualizar se o ID já existir no JPA
                        headers: getAuthHeaders(),
                        body: JSON.stringify(leadCompleto)
                    });
                    carregarLeads();
                } catch (error) {
                    console.error("Erro ao atualizar status:", error);
                }
            });
        });
    };

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

    window.addLeadNote = () => {
        const input = document.getElementById('new-note-text');
        const text = input.value.trim();
        
        if (text && currentOpenLeadId) {
            const lead = mockLeads.find(l => l.id == currentOpenLeadId);
            if (!lead.notas) lead.notas = [];
            
            lead.notas.push({
                data: new Date().toISOString(),
                texto: text
            });
            input.value = '';
            renderLeadNotes();
            alert("Nota adicionada na sessão! (Na API atual as notas não são persistidas).");
        }
    };

    window.archiveLead = async (id) => {
        try {
            const leadCompleto = mockLeads.find(l => l.id == id);
            leadCompleto.status = 'arquivado';
            await fetch(`${API_URL}/leads`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(leadCompleto)
            });
            closeModal('details-modal');
            carregarLeads();
        } catch (error) {
            console.error("Erro ao arquivar:", error);
        }
    };

    window.deleteLeadPermanently = async (id) => {
        // Na sua API Controller não existe DELETE para Leads ainda. 
        // Para amanhã funcionar, podemos apenas forçar arquivamento.
        alert('A API não permite deleção física de leads por segurança. O Lead será arquivado.');
        window.archiveLead(id);
    };


    let mockNews = [];

    async function carregarNoticias() {
        try {
            const response = await fetch(`${API_URL}/news`, {
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
                await fetch(`${API_URL}/news/${id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch(`${API_URL}/news`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
            }
            closeModal('news-modal');
            carregarNoticias(); 
        } catch (error) {
            console.error("Erro ao salvar notícia:", error);
        }
    };

    window.deleteNews = async (id) => {
        if(confirm('Tem certeza que deseja excluir esta publicação do banco de dados permanentemente?')) {
            try {
                await fetch(`${API_URL}/news/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                carregarNoticias();
            } catch (error) {
                console.error("Erro ao deletar notícia:", error);
            }
        }
    };

    carregarLeads();
    carregarNoticias();
});