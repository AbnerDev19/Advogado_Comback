# Vitor Rocha — Advocacia e Assessoria Jurídica
## Sistema Web — PI3 IFB | Sprint 3

Repositório do Projeto Integrador III desenvolvido no Instituto Federal de Brasília (IFB).
Sistema web para o escritório **Vitor Rocha — Advocacia e Assessoria Jurídica**, com front-end institucional, API REST em Java Spring Boot e banco de dados PostgreSQL.

---

## Estado atual do sistema (Sprint 3)

| Módulo | Status |
|---|---|
| Front-end institucional (index, noticias) | ✅ Implementado |
| Front-end dashboard (layout) | ✅ Implementado |
| API — Autenticação (JWT) | ✅ Implementado |
| API — Gestão de Leads | ✅ Implementado |
| API — Gestão de Artigos | ✅ Implementado |
| Banco de dados (PostgreSQL) | ✅ Implementado |
| Integração front-end ↔ back-end | 🔜 Sprint 4 |

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | HTML5, CSS3, JavaScript (Vanilla) |
| Back-end | Java 17, Spring Boot 3.2, Spring Security, JPA/Hibernate |
| Banco de dados | PostgreSQL 15+ |
| Autenticação | JWT (JSON Web Token) |
| Build | Maven 3.9+ |

---

## Pré-requisitos

- Java 17+
- Maven 3.9+
- PostgreSQL 15+

---

## Setup e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/advogado-pi3.git
cd advogado-pi3
```

### 2. Criar o banco de dados

```sql
CREATE DATABASE advogado_db;
```

### 3. Configurar credenciais

Editar `api/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/advogado_db
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
```

### 4. Executar a API

```bash
cd api
mvn spring-boot:run
```

A API iniciará em `http://localhost:8080`

O schema e os dados de seed são criados automaticamente na primeira execução.

---

## Credenciais padrão (seed)

| Campo | Valor |
|---|---|
| E-mail | admin@vitorrochaadv.com.br |
| Senha | admin123 |

---

## Endpoints da API

### Autenticação

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Autenticar e receber JWT |

### Leads (formulário de contato)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/leads` | Público | Criar lead (formulário do site) |
| GET | `/api/leads` | 🔒 JWT | Listar todos os leads |
| GET | `/api/leads?status=NOVO_CONTATO` | 🔒 JWT | Filtrar por status |
| GET | `/api/leads/stats` | 🔒 JWT | Contadores por status |
| GET | `/api/leads/{id}` | 🔒 JWT | Detalhar lead |
| PUT | `/api/leads/{id}/status` | 🔒 JWT | Atualizar status |
| PUT | `/api/leads/{id}/notas` | 🔒 JWT | Salvar notas internas |
| DELETE | `/api/leads/{id}` | 🔒 JWT | Excluir lead |

### Artigos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/artigos` | Público | Listar artigos publicados |
| GET | `/api/artigos/{slug}` | Público | Buscar artigo por slug |
| GET | `/api/artigos/admin` | 🔒 JWT | Listar todos (inc. rascunhos) |
| POST | `/api/artigos` | 🔒 JWT | Criar artigo |
| PUT | `/api/artigos/{id}` | 🔒 JWT | Atualizar artigo |
| DELETE | `/api/artigos/{id}` | 🔒 JWT | Excluir artigo |

### Status de leads

```
NOVO_CONTATO | EM_ANDAMENTO | CONCLUIDO | ARQUIVADO
```

---

## Exemplos de uso (Postman / curl)

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vitorrochaadv.com.br","senha":"admin123"}'
```

### Criar lead (formulário do site)
```bash
curl -X POST http://localhost:8080/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Souza",
    "contato": "(61) 9 9999-0000",
    "area": "IMOBILIARIO",
    "motivo": "Preciso revisar um contrato de compra e venda de imóvel."
  }'
```

### Listar leads (autenticado)
```bash
curl http://localhost:8080/api/leads \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## Estrutura do repositório

```
advogado-pi3/
├── api/                        # Back-end Spring Boot
│   ├── pom.xml
│   └── src/main/
│       ├── java/br/com/vitorrocha/api/
│       │   ├── controller/     # AuthController, LeadController, ArtigoController
│       │   ├── model/          # Lead, Usuario, Artigo (entidades JPA)
│       │   ├── repository/     # Interfaces Spring Data JPA
│       │   ├── service/        # Regras de negócio
│       │   ├── dto/            # Objetos de transferência de dados
│       │   ├── security/       # JwtUtil, JwtFilter
│       │   └── config/         # SecurityConfig
│       └── resources/
│           ├── application.properties
│           └── db/
│               ├── schema.sql  # Criação das tabelas
│               └── data.sql    # Dados iniciais
├── frontend/                   # Front-end (HTML/CSS/JS)
└── docs/                       # Documentação do projeto
```

---

## Links

- 📋 Kanban: [link do quadro]
- 🎨 Protótipo: [link do Figma/GitHub Pages]
- 📄 Documentação: `docs/documentacao-sprint3.pdf`

---

## Integrantes do grupo

| Nome | GitHub |
|---|---|
| [Integrante 1] | @usuario |
| [Integrante 2] | @usuario |
| [Integrante 3] | @usuario |
