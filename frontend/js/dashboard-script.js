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
    // 1. MÓDULO: CONTATOS (LEADS & NOTAS)
    // ==========================================
    let mockLeads = [
        { id: 'LD-001', nome: 'Carlos Eduardo Mendes', contato: 'carlos.mendes@email.com', motivo: 'Revisão de contrato social da empresa', status: 'novo_contato', data_registro: '2026-04-20T10:30:00Z', notas: [{ data: '2026-04-20T11:00:00Z', texto: 'Aguardando envio do contrato atual para análise.' }] },
        { id: 'LD-002', nome: 'Fernanda Albuquerque', contato: '(61) 98888-7777', motivo: 'Planejamento sucessório familiar', status: 'em_andamento', data_registro: '2026-04-18T14:15:00Z', notas: [] },
        { id: 'LD-003', nome: 'Ricardo Gomes', contato: 'ricardo@empresa.com.br', motivo: 'Consulta sobre compliance digital', status: 'arquivado', data_registro: '2026-04-10T09:00:00Z', notas: [] }
    ];

    let currentOpenLeadId = null;

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    };

    const updateLeadStats = () => {
        document.getElementById('count-novos').textContent = mockLeads.filter(l => l.status === 'novo_contato').length;
        document.getElementById('count-andamento').textContent = mockLeads.filter(l => l.status === 'em_andamento').length;
        // Total Ativo ignora arquivados
        document.getElementById('count-total').textContent = mockLeads.filter(l => l.status !== 'arquivado').length; 
    };

    const renderLeadsTable = (filterStatus = 'all') => {
        const leadsTableBody = document.getElementById('leads-table-body');
        leadsTableBody.innerHTML = '';
        
        // Por padrão oculta arquivados na visão "Todos"
        let filtered = filterStatus === 'all' 
            ? mockLeads.filter(l => l.status !== 'arquivado') 
            : mockLeads.filter(l => l.status === filterStatus);

        if (filtered.length === 0) {
            leadsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhum contato encontrado.</td></tr>`;
            return;
        }

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

        // Atualização de Status via Select
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const newStatus = e.target.value;
                const lead = mockLeads.find(l => l.id === e.target.getAttribute('data-id'));
                if(lead) { 
                    lead.status = newStatus; 
                    updateLeadStats(); 
                    renderLeadsTable(document.querySelector('.filter-btn.active').getAttribute('data-filter'));
                }
            });
        });
    };

    // Botões de Filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderLeadsTable(e.target.getAttribute('data-filter'));
        });
    });

    // Abrir Modal de Gerenciamento do Lead
    window.openLeadDetails = (id) => {
        currentOpenLeadId = id;
        const lead = mockLeads.find(l => l.id === id);
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

    // Renderizar e Adicionar Notas Internas
    const renderLeadNotes = () => {
        const lead = mockLeads.find(l => l.id === currentOpenLeadId);
        const notesContainer = document.getElementById('lead-notes-list');
        
        if (!lead.notas || lead.notas.length === 0) {
            notesContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">Nenhuma nota adicionada. O cliente não vê essas anotações.</p>';
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
            const lead = mockLeads.find(l => l.id === currentOpenLeadId);
            if (!lead.notas) lead.notas = [];
            
            lead.notas.push({
                data: new Date().toISOString(),
                texto: text
            });
            
            input.value = '';
            renderLeadNotes();
        }
    };

    window.archiveLead = (id) => {
        const lead = mockLeads.find(l => l.id === id);
        if(lead) {
            lead.status = 'arquivado';
            closeModal('details-modal');
            updateLeadStats();
            renderLeadsTable(document.querySelector('.filter-btn.active').getAttribute('data-filter'));
        }
    };

    window.deleteLeadPermanently = (id) => {
        if (confirm('ATENÇÃO: A exclusão permanente apagará o lead e TODAS as suas notas internas. Não pode ser desfeito. Deseja continuar?')) {
            mockLeads = mockLeads.filter(l => l.id !== id);
            closeModal('details-modal');
            updateLeadStats();
            renderLeadsTable(document.querySelector('.filter-btn.active').getAttribute('data-filter'));
        }
    };

    // Inicialização Contatos
    updateLeadStats();
    renderLeadsTable();


    // ==========================================
    // 2. MÓDULO: PUBLICAÇÕES E NOTÍCIAS (ARTIGOS)
    // ==========================================
    let mockNews = [
        { 
            id: 1, 
            titulo: 'Acordo de sócios: o que precisa constar para evitar conflitos?', 
            slug: 'acordo-socios-evitar-conflitos',
            resumo: 'Um acordo de sócios bem redigido é vital para a saúde da empresa. Entenda quais cláusulas são indispensáveis.',
            categoria: 'Direito Empresarial', 
            status: 'Publicado', 
            conteudo: '<p>Um acordo de sócios bem redigido é um dos instrumentos mais importantes para a saúde de qualquer sociedade.</p>', 
            data: '2026-04-10' 
        }
    ];

    const newsTableBody = document.getElementById('news-table-body');

    window.renderNewsTable = () => {
        newsTableBody.innerHTML = '';
        if (mockNews.length === 0) {
            newsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nenhuma notícia cadastrada.</td></tr>`;
            return;
        }

        mockNews.forEach(news => {
            const tr = document.createElement('tr');
            const badgeClass = news.status === 'Publicado' ? 'publicado' : 'rascunho';
            
            tr.innerHTML = `
                <td>${formatDate(news.data).split(',')[0]}</td>
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
            // Edição
            const news = mockNews.find(n => n.id === id);
            document.getElementById('news-modal-title').textContent = 'Editar Notícia';
            document.getElementById('news-id').value = news.id;
            document.getElementById('news-title').value = news.titulo;
            document.getElementById('news-slug').value = news.slug;
            document.getElementById('news-category').value = news.categoria;
            document.getElementById('news-status').value = news.status;
            document.getElementById('news-summary').value = news.resumo;
            document.getElementById('news-content').value = news.conteudo;
        } else {
            // Nova publicação
            form.reset();
            document.getElementById('news-modal-title').textContent = 'Nova Notícia';
            document.getElementById('news-id').value = '';
        }
        
        modal.classList.add('is-active');
    };

    // Auto-geração de Slug a partir do Título
    document.getElementById('news-title')?.addEventListener('blur', (e) => {
        const slugInput = document.getElementById('news-slug');
        if (!slugInput.value && e.target.value) {
            // Converte para minúsculas, remove acentos e substitui espaços por hífens
            slugInput.value = e.target.value.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
    });

    window.saveNews = (event) => {
        event.preventDefault();
        
        const id = document.getElementById('news-id').value;
        const titulo = document.getElementById('news-title').value;
        const slug = document.getElementById('news-slug').value;
        const categoria = document.getElementById('news-category').value;
        const status = document.getElementById('news-status').value;
        const resumo = document.getElementById('news-summary').value;
        const conteudo = document.getElementById('news-content').value;

        if (id) {
            const index = mockNews.findIndex(n => n.id == id);
            mockNews[index] = { ...mockNews[index], titulo, slug, categoria, status, resumo, conteudo };
        } else {
            mockNews.unshift({
                id: Date.now(),
                titulo, slug, categoria, status, resumo, conteudo,
                data: new Date().toISOString()
            });
        }

        closeModal('news-modal');
        renderNewsTable();
    };

    window.deleteNews = (id) => {
        if(confirm('Tem certeza que deseja excluir esta publicação? Esta ação apagará o artigo permanentemente.')) {
            mockNews = mockNews.filter(n => n.id !== id);
            renderNewsTable();
        }
    };

    // Inicialização Notícias
    renderNewsTable();
});