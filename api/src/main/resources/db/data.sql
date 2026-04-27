-- =====================================================
-- Dados iniciais — seed
-- Senha padrão: admin123 (BCrypt hash)
-- =====================================================

INSERT INTO usuarios (nome, email, senha, role)
VALUES (
    'Dr. Vitor Rocha',
    'admin@vitorrochaadv.com.br',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu',
    'ADMIN'
) ON CONFLICT (email) DO NOTHING;

-- Lead de exemplo
INSERT INTO leads (nome, contato, area, motivo, status)
VALUES (
    'João da Silva',
    'joao@email.com',
    'EMPRESARIAL',
    'Preciso de ajuda para constituir uma sociedade limitada com dois sócios.',
    'NOVO_CONTATO'
) ON CONFLICT DO NOTHING;

-- Artigo de exemplo
INSERT INTO artigos (titulo, slug, resumo, conteudo, categoria, status, publicado_em)
VALUES (
    'Acordo de sócios: o que precisa constar para evitar conflitos futuros?',
    'acordo-de-socios-o-que-precisa-constar',
    'Um acordo de sócios bem redigido é um dos instrumentos mais importantes para a saúde de qualquer sociedade.',
    '<p>Um acordo de sócios bem redigido é um dos instrumentos mais importantes para a saúde de qualquer sociedade...</p>',
    'Direito Empresarial',
    'PUBLICADO',
    CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO NOTHING;
