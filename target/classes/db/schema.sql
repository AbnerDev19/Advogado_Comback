-- =============================================================================
-- SCHEMA — Vitor Rocha Advocacia e Assessoria Jurídica
-- Sistema Web PI3 IFB | Sprint 4
-- Banco: PostgreSQL 15+
-- Gerado automaticamente pelo Hibernate (spring.jpa.hibernate.ddl-auto=update)
-- Este arquivo serve como documentação e para criação manual quando necessário.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABELA: usuarios
-- Armazena as credenciais dos administradores do sistema.
-- Acesso: somente via painel interno. Senha armazenada com hash BCrypt.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id      BIGSERIAL    PRIMARY KEY,               -- Identificador único autoincremental
    email   VARCHAR(255) NOT NULL UNIQUE,           -- E-mail usado no login (único)
    senha   VARCHAR(255) NOT NULL,                  -- Hash BCrypt da senha (nunca texto puro)
    role    VARCHAR(50)  NOT NULL DEFAULT 'ADMIN'   -- Papel do usuário (atualmente só ADMIN)
);

-- -----------------------------------------------------------------------------
-- TABELA: leads
-- Registra os contatos recebidos pelo formulário do site institucional.
-- Inserção pública (sem autenticação). Gestão requer JWT.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id            BIGSERIAL    PRIMARY KEY,
    nome          VARCHAR(255),                      -- Nome completo do cliente
    contato       VARCHAR(255),                      -- Telefone ou e-mail informado
    area          VARCHAR(100),                      -- Área jurídica de interesse
                                                     -- Valores: EMPRESARIAL, IMOBILIARIO,
                                                     --          FAMILIA, CONTRATOS, OUTRO
    motivo        TEXT,                              -- Descrição livre da solicitação
    status        VARCHAR(50)  DEFAULT 'novo_contato', -- Ciclo de vida do contato:
                                                     -- novo_contato → em_andamento
                                                     -- → concluido | arquivado
    origem        VARCHAR(100) DEFAULT 'formulario_site', -- Canal de entrada
    data_criacao  TIMESTAMP    DEFAULT NOW()         -- Data/hora de criação (UTC)
);

-- -----------------------------------------------------------------------------
-- TABELA: notas
-- Notas internas associadas a um lead. Visíveis apenas no dashboard admin.
-- Relacionamento N:1 com leads (cascade delete).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notas (
    id       BIGSERIAL  PRIMARY KEY,
    texto    TEXT       NOT NULL,           -- Conteúdo da nota interna
    data     TIMESTAMP  DEFAULT NOW(),      -- Data/hora de criação da nota
    lead_id  BIGINT     NOT NULL            -- Chave estrangeira para leads
        REFERENCES leads(id)
        ON DELETE CASCADE                   -- Ao excluir lead, exclui notas vinculadas
);

-- -----------------------------------------------------------------------------
-- TABELA: news
-- Artigos e publicações jurídicas do blog. Leitura pública (status=Publicado).
-- Criação/edição/exclusão requer JWT.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news (
    id               BIGSERIAL    PRIMARY KEY,
    titulo           VARCHAR(255) NOT NULL,          -- Título do artigo
    slug             VARCHAR(255) NOT NULL UNIQUE,   -- URL amigável (ex: acordo-de-socios)
    categoria        VARCHAR(100),                   -- Categoria: Direito Empresarial,
                                                     -- Direito Imobiliário, Família e
                                                     -- Sucessões, Contratos, etc.
    status           VARCHAR(50)  DEFAULT 'Rascunho',-- 'Rascunho' ou 'Publicado'
    resumo           TEXT,                           -- Resumo exibido no card do blog
    conteudo         TEXT,                           -- Conteúdo completo do artigo (HTML/MD)
    data_publicacao  TIMESTAMP    DEFAULT NOW()      -- Data/hora de publicação
);

-- =============================================================================
-- ÍNDICES DE DESEMPENHO
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_criacao    ON leads(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_notas_lead       ON notas(lead_id);
CREATE INDEX IF NOT EXISTS idx_news_status      ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_slug        ON news(slug);

-- =============================================================================
-- DADOS INICIAIS (seed)
-- O usuário admin é inserido automaticamente pelo DataInitializer.java
-- usando as variáveis de ambiente ADMIN_EMAIL e ADMIN_PASSWORD.
-- =============================================================================
