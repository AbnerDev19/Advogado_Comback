
CREATE TABLE IF NOT EXISTS administrador (
    id_admin  BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome      VARCHAR(150) NOT NULL,
    email     VARCHAR(150) NOT NULL UNIQUE,
    senha     VARCHAR(255) NOT NULL,         -- Hash BCrypt
    role      VARCHAR(30)  NOT NULL DEFAULT 'ADMIN'
);


CREATE TABLE IF NOT EXISTS cliente (
    id_cliente BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome       VARCHAR(150) NOT NULL,
    email      VARCHAR(150),
    telefone   VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS noticia (
    id_noticia      BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo          VARCHAR(255)  NOT NULL,
    conteudo        TEXT          NOT NULL,
    categoria       VARCHAR(100),
    data_publicacao DATE          NOT NULL DEFAULT CURRENT_DATE,
    id_admin        BIGINT        NOT NULL,
    CONSTRAINT fk_noticia_admin FOREIGN KEY (id_admin)
        REFERENCES administrador(id_admin) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS contato (
    id_contato BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mensagem   TEXT         NOT NULL,
    data_envio TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status     VARCHAR(20)  NOT NULL DEFAULT 'pendente',  -- pendente | atendido
    id_cliente BIGINT       NOT NULL,
    CONSTRAINT fk_contato_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('pendente', 'atendido'))
);

-- ── Índices para performance ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contato_status    ON contato(status);
CREATE INDEX IF NOT EXISTS idx_contato_data      ON contato(data_envio DESC);
CREATE INDEX IF NOT EXISTS idx_noticia_data      ON noticia(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_noticia_categoria ON noticia(categoria);
CREATE INDEX IF NOT EXISTS idx_cliente_email     ON cliente(email);

-- ── Admin padrão (senha: Advogado@2024 em BCrypt) ───────────
