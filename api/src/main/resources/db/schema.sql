-- =====================================================
-- Vitor Rocha Advocacia — Schema do Banco de Dados
-- Sprint 3 — PI3 IFB
-- =====================================================

-- Limpar tabelas existentes (ordem inversa de dependências)
DROP TABLE IF EXISTS artigos CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ─────────────────────────────────────────────────
-- Tabela: usuarios
-- Armazena os administradores do sistema (advogados)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(150)        NOT NULL,
    email       VARCHAR(200)        NOT NULL UNIQUE,
    senha       VARCHAR(255)        NOT NULL,  -- BCrypt hash
    role        VARCHAR(20)         NOT NULL DEFAULT 'ADMIN',
    ativo       BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────
-- Tabela: leads
-- Armazena os contatos recebidos pelo formulário do site
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    id              BIGSERIAL PRIMARY KEY,
    nome            VARCHAR(150)    NOT NULL,
    contato         VARCHAR(200)    NOT NULL,   -- e-mail ou telefone
    area            VARCHAR(50),                -- área de interesse
    motivo          TEXT            NOT NULL,   -- descrição do caso
    status          VARCHAR(30)     NOT NULL DEFAULT 'NOVO_CONTATO',
    -- Valores: NOVO_CONTATO | EM_ANDAMENTO | CONCLUIDO | ARQUIVADO
    notas_internas  TEXT,                       -- anotações privadas do advogado
    origem          VARCHAR(50)     NOT NULL DEFAULT 'FORMULARIO_SITE',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────
-- Tabela: artigos
-- Armazena os artigos jurídicos publicados no site
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artigos (
    id              BIGSERIAL PRIMARY KEY,
    titulo          VARCHAR(300)    NOT NULL,
    slug            VARCHAR(300)    NOT NULL UNIQUE,
    resumo          TEXT            NOT NULL,
    conteudo        TEXT            NOT NULL,
    categoria       VARCHAR(80)     NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'RASCUNHO',
    -- Valores: RASCUNHO | PUBLICADO
    publicado_em    TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────
-- Índices para performance
-- ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_status      ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at  ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artigos_status    ON artigos(status);
CREATE INDEX IF NOT EXISTS idx_artigos_slug      ON artigos(slug);
CREATE INDEX IF NOT EXISTS idx_usuarios_email    ON usuarios(email);
