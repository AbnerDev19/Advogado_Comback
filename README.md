# Vitor Rocha Advocacia — Backend Java

Backend completo em **Java 17 + Spring Boot 3** para o site institucional de advocacia.

---

## 🚀 Como rodar

### Pré-requisitos
- **Java 17+** instalado
- **Maven 3.8+** instalado

### 1. Rodar localmente

```bash
cd advogado-backend
mvn spring-boot:run
```

O servidor sobe em **http://localhost:8080**

---

## 🔐 Credenciais padrão do painel admin

| Campo  | Valor                      |
|--------|----------------------------|
| E-mail | `admin@vitorrocha.adv.br`  |
| Senha  | `Advogado@2024`            |

> ⚠️ Altere a senha em `src/main/resources/application.properties` antes de colocar em produção.

---

## 📄 Páginas do site

| URL                            | Descrição                      |
|--------------------------------|--------------------------------|
| `http://localhost:8080/`       | Site principal (index.html)    |
| `http://localhost:8080/login.html`     | Login do painel admin  |
| `http://localhost:8080/dashboard.html` | Painel de leads (requer login) |
| `http://localhost:8080/noticias.html`  | Página de notícias             |
| `http://localhost:8080/h2-console`     | Console do banco de dados      |

---

## 🔌 API REST

### Autenticação

| Método | Rota             | Acesso  | Descrição              |
|--------|------------------|---------|------------------------|
| POST   | `/api/auth/login`| Público | Login → retorna JWT    |
| GET    | `/api/auth/me`   | Privado | Dados do usuário logado|

**Exemplo de login:**
```json
POST /api/auth/login
{
  "email": "admin@vitorrocha.adv.br",
  "password": "Advogado@2024"
}
```

---

### Leads (formulário de contato)

| Método | Rota                     | Acesso  | Descrição                    |
|--------|--------------------------|---------|------------------------------|
| POST   | `/api/leads/publico`     | Público | Recebe formulário do site    |
| GET    | `/api/leads`             | Privado | Lista todos os leads         |
| GET    | `/api/leads?status=novo_contato` | Privado | Filtra por status  |
| GET    | `/api/leads/{id}`        | Privado | Busca um lead por ID         |
| PATCH  | `/api/leads/{id}/status` | Privado | Atualiza status de um lead   |
| DELETE | `/api/leads/{id}`        | Privado | Remove um lead               |
| GET    | `/api/leads/stats`       | Privado | Estatísticas do painel       |

**Status disponíveis:** `novo_contato` · `em_andamento` · `concluido`

**Exemplo de formulário público:**
```json
POST /api/leads/publico
{
  "nome": "João Silva",
  "contato": "joao@email.com",
  "motivo": "Preciso de consultoria jurídica sobre contrato"
}
```

**Autenticação nas rotas privadas:**
```
Authorization: Bearer <seu_token_jwt>
```

---

## 🗄️ Banco de Dados

O projeto usa **H2** (banco embutido) com persistência em arquivo local.

- Os dados ficam salvos em `./data/advocacia-db.mv.db`
- Acesse o console em: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:file:./data/advocacia-db`
  - Usuário: `sa` — Senha: *(vazio)*

---

## ⚙️ Configurações (application.properties)

```properties
# Porta do servidor
server.port=8080

# Credenciais do admin inicial
app.admin.email=admin@vitorrocha.adv.br
app.admin.password=Advogado@2024
app.admin.nome=Dr. Vitor Rocha

# JWT — troque o secret em produção!
app.jwt.secret=VitorRochaAdvocacia2024SecretKey...
app.jwt.expiration-ms=86400000   # 24 horas
```

---

## 🏗️ Estrutura do projeto

```
advogado-backend/
├── pom.xml
├── README.md
└── src/main/
    ├── java/com/vitorrocha/advocacia/
    │   ├── AdvocaciaApplication.java       ← Ponto de entrada
    │   ├── config/
    │   │   ├── SecurityConfig.java         ← Spring Security + CORS
    │   │   └── DataInitializer.java        ← Cria admin na 1ª inicialização
    │   ├── controller/
    │   │   ├── AuthController.java         ← Login / JWT
    │   │   └── LeadController.java         ← API de leads
    │   ├── dto/
    │   │   ├── Auth.java                   ← DTOs de autenticação
    │   │   ├── LeadRequest.java            ← DTO do formulário público
    │   │   └── LeadStatusUpdate.java       ← DTO para atualização de status
    │   ├── model/
    │   │   ├── Lead.java                   ← Entidade de lead/contato
    │   │   └── Usuario.java                ← Entidade de usuário admin
    │   ├── repository/
    │   │   ├── LeadRepository.java
    │   │   └── UsuarioRepository.java
    │   ├── security/
    │   │   ├── JwtUtils.java               ← Geração e validação de JWT
    │   │   ├── JwtAuthFilter.java          ← Filtro de autenticação
    │   │   └── UserDetailsServiceImpl.java
    │   └── service/
    │       └── LeadService.java            ← Regras de negócio
    └── resources/
        ├── application.properties
        └── static/                         ← Frontend servido pelo Spring
            ├── index.html
            ├── login.html
            ├── dashboard.html
            ├── noticias.html
            ├── css/
            └── js/
```

---

## 📦 Gerar o JAR para deploy

```bash
mvn clean package -DskipTests
java -jar target/advocacia-1.0.0.jar
```

O JAR já contém o frontend embutido — basta distribuir esse único arquivo.
