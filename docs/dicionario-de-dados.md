# Dicionário de Dados
## Sistema Web — Vitor Rocha Advocacia e Assessoria Jurídica
### PI3 IFB | Sprint 4

---

## Banco de Dados: `advocaciadb` (PostgreSQL 15+)

---

## Tabela: `usuarios`

Armazena as credenciais dos administradores do painel interno.

| Campo  | Tipo          | Nulo | Padrão  | Descrição                                         |
|--------|---------------|------|---------|---------------------------------------------------|
| `id`   | BIGSERIAL     | Não  | —       | Identificador único autoincremental (PK)          |
| `email`| VARCHAR(255)  | Não  | —       | E-mail de login. Único no sistema (UNIQUE)        |
| `senha`| VARCHAR(255)  | Não  | —       | Senha armazenada como hash BCrypt (nunca texto puro) |
| `role` | VARCHAR(50)   | Não  | `ADMIN` | Papel do usuário. Valor atual: `ADMIN`            |

**Regras:**
- O usuário admin inicial é criado automaticamente na primeira execução via `DataInitializer.java`.
- Credenciais configuradas pelas variáveis de ambiente `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

---

## Tabela: `leads`

Registra os contatos recebidos pelo formulário do site institucional.

| Campo          | Tipo          | Nulo | Padrão             | Descrição                                          |
|----------------|---------------|------|--------------------|----------------------------------------------------|
| `id`           | BIGSERIAL     | Não  | —                  | Identificador único autoincremental (PK)           |
| `nome`         | VARCHAR(255)  | Sim  | —                  | Nome completo do cliente                           |
| `contato`      | VARCHAR(255)  | Sim  | —                  | Telefone ou e-mail informado pelo cliente          |
| `area`         | VARCHAR(100)  | Sim  | —                  | Área jurídica de interesse (ver domínio abaixo)    |
| `motivo`       | TEXT          | Sim  | —                  | Descrição livre da solicitação do cliente          |
| `status`       | VARCHAR(50)   | Sim  | `novo_contato`     | Status atual no fluxo de atendimento               |
| `origem`       | VARCHAR(100)  | Sim  | `formulario_site`  | Canal de entrada do contato                        |
| `data_criacao` | TIMESTAMP     | Sim  | `NOW()`            | Data e hora de criação do registro                 |

**Domínio do campo `area`:**
| Valor            | Descrição                  |
|------------------|----------------------------|
| `EMPRESARIAL`    | Direito Empresarial        |
| `IMOBILIARIO`    | Direito Imobiliário        |
| `FAMILIA`        | Família e Sucessões        |
| `CONTRATOS`      | Contratos                  |
| `OUTRO`          | Outras áreas               |

**Domínio do campo `status` (ciclo de vida):**
| Valor          | Descrição                               |
|----------------|-----------------------------------------|
| `novo_contato` | Lead recém-chegado, ainda não tratado   |
| `em_andamento` | Contato em tratamento pelo advogado     |
| `concluido`    | Atendimento finalizado                  |
| `arquivado`    | Lead descartado ou arquivado            |

---

## Tabela: `notas`

Notas internas vinculadas a um lead. Visíveis apenas no dashboard administrativo.

| Campo     | Tipo      | Nulo | Padrão    | Descrição                                      |
|-----------|-----------|------|-----------|------------------------------------------------|
| `id`      | BIGSERIAL | Não  | —         | Identificador único autoincremental (PK)       |
| `texto`   | TEXT      | Não  | —         | Conteúdo da nota interna                       |
| `data`    | TIMESTAMP | Sim  | `NOW()`   | Data e hora em que a nota foi registrada       |
| `lead_id` | BIGINT    | Não  | —         | Chave estrangeira para `leads.id` (FK)         |

**Relacionamentos:**
- `notas.lead_id` → `leads.id` (N:1)
- `ON DELETE CASCADE`: ao excluir um lead, todas as notas vinculadas são removidas automaticamente.

---

## Tabela: `news`

Artigos e publicações jurídicas do blog institucional.

| Campo             | Tipo          | Nulo | Padrão      | Descrição                                           |
|-------------------|---------------|------|-------------|-----------------------------------------------------|
| `id`              | BIGSERIAL     | Não  | —           | Identificador único autoincremental (PK)            |
| `titulo`          | VARCHAR(255)  | Não  | —           | Título do artigo                                    |
| `slug`            | VARCHAR(255)  | Não  | —           | URL amigável gerada a partir do título (UNIQUE)     |
| `categoria`       | VARCHAR(100)  | Sim  | —           | Categoria temática do artigo                        |
| `status`          | VARCHAR(50)   | Sim  | `Rascunho`  | Estado de publicação                                |
| `resumo`          | TEXT          | Sim  | —           | Resumo exibido nos cards do blog                    |
| `conteudo`        | TEXT          | Sim  | —           | Conteúdo completo do artigo                         |
| `data_publicacao` | TIMESTAMP     | Sim  | `NOW()`     | Data e hora de publicação                           |

**Domínio do campo `status`:**
| Valor        | Visibilidade                              |
|--------------|-------------------------------------------|
| `Rascunho`   | Visível apenas no dashboard (admin)       |
| `Publicado`  | Visível no site público (`noticias.html`) |

**Domínio do campo `categoria`:**
- Direito Empresarial
- Direito Imobiliário
- Família e Sucessões
- Contratos
- (outros valores livres)

---

## Diagrama de Relacionamentos (simplificado)

```
usuarios
  └── (sem FK, autônomo)

leads (1) ──────< notas (N)
  └── leads.id = notas.lead_id

news
  └── (sem FK, autônomo)
```

---

## Índices

| Índice                 | Tabela  | Coluna(s)      | Motivo                                      |
|------------------------|---------|----------------|---------------------------------------------|
| `idx_leads_status`     | leads   | status         | Filtro por status no dashboard              |
| `idx_leads_criacao`    | leads   | data_criacao   | Ordenação por data (mais recente primeiro)  |
| `idx_notas_lead`       | notas   | lead_id        | JOIN com leads                              |
| `idx_news_status`      | news    | status         | Filtro de artigos publicados                |
| `idx_news_slug`        | news    | slug           | Busca por slug (endpoint público)           |
