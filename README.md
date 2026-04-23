# Vitor Rocha Advocacia — Backend Java (atualizado)

Backend completo em **Java 17 + Spring Boot 3**, fiel ao DER do projeto.

---

## 🗄️ Modelo de dados (DER)

```
ADMINISTRADOR (id_admin, nome, email, senha)
      │
      └──▶ NOTICIA (id_noticia, titulo, conteudo, categoria, data_publicacao, id_admin FK)

CLIENTE (id_cliente, nome, email, telefone)
      │
      └──▶ CONTATO (id_contato, mensagem, data_envio, status[pendente|atendido], id_cliente FK)
```

---

## 🚀 Como rodar

### Pré-requisitos
- Java 17+
- Maven 3.8+

```bash
cd adv-backend
mvn spring-boot:run
```

Acesse: **http://localhost:8080**

---

## 🔐 Credenciais do painel admin

| Campo  | Valor                     |
|--------|---------------------------|
| E-mail | `admin@vitorrocha.adv.br` |
| Senha  | `Advogado@2024`           |

> Altere em `application.properties` antes de publicar.

---

## 📄 Páginas

| URL | Descrição |
|-----|-----------|
| `/` | Site principal |
| `/login.html` | Login do painel |
| `/dashboard.html` | Painel (contatos + notícias) |
| `/noticias.html` | Notícias dinâmicas da API |
| `/h2-console` | Console do banco (dev) |

---

## 🔌 API REST

### Auth
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/api/auth/login` | Público | Retorna JWT |
| GET | `/api/auth/me` | Privado | Dados do admin |

### Contatos
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/api/contatos/publico` | **Público** | Formulário do site (cria Cliente + Contato) |
| GET | `/api/contatos` | Privado | Lista contatos |
| GET | `/api/contatos?status=pendente` | Privado | Filtra por status |
| PATCH | `/api/contatos/{id}/status` | Privado | Atualiza status |
| DELETE | `/api/contatos/{id}` | Privado | Remove contato |
| GET | `/api/contatos/stats` | Privado | Estatísticas |

**Status disponíveis:** `pendente` · `atendido`

### Notícias
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/api/noticias/publicas` | **Público** | Lista para noticias.html |
| GET | `/api/noticias/publicas/{id}` | **Público** | Detalhe de uma notícia |
| GET | `/api/noticias` | Privado | Lista para o painel |
| POST | `/api/noticias` | Privado | Publica nova notícia |
| PUT | `/api/noticias/{id}` | Privado | Edita notícia |
| DELETE | `/api/noticias/{id}` | Privado | Remove notícia |

---

## 🔄 Trocar H2 → PostgreSQL (produção)

No `application.properties`, comente as linhas H2 e descomente as PostgreSQL:

```properties
spring.datasource.url=jdbc:postgresql://SEU_HOST:5432/SEU_BANCO
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.h2.console.enabled=false
```

O arquivo `schema.sql` na raiz do projeto pode ser usado para criar as tabelas manualmente no PostgreSQL.

---

## 🏗️ Estrutura

```
adv-backend/
├── pom.xml
├── schema.sql                          ← SQL do modelo físico
├── README.md
└── src/main/
    ├── java/com/vitorrocha/advocacia/
    │   ├── model/
    │   │   ├── Administrador.java      ← Entidade ADMINISTRADOR
    │   │   ├── Cliente.java            ← Entidade CLIENTE
    │   │   ├── Contato.java            ← Entidade CONTATO (status: pendente/atendido)
    │   │   └── Noticia.java            ← Entidade NOTICIA
    │   ├── repository/                 ← Interfaces JPA
    │   ├── service/
    │   │   ├── ContatoService.java     ← Cria Cliente + Contato do formulário
    │   │   └── NoticiaService.java
    │   ├── controller/
    │   │   ├── AuthController.java
    │   │   ├── ContatoController.java
    │   │   └── NoticiaController.java
    │   ├── security/                   ← JWT + filtros
    │   └── config/                     ← Security + DataInitializer
    └── resources/
        ├── application.properties
        └── static/                     ← Frontend completo
            ├── index.html
            ├── login.html
            ├── dashboard.html          ← Abas: Contatos + Notícias
            ├── noticias.html           ← Notícias dinâmicas da API
            ├── css/
            └── js/
                ├── script.js           ← Formulário de contato → API
                ├── login-script.js     ← Autenticação JWT
                ├── dashboard-script.js ← Painel completo
                └── noticias-script.js  ← Carrega notícias da API
```
