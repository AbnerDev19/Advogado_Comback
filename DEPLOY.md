# 🚀 Guia de Deploy — Advocacia API

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

---

## 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com valores reais. **Nunca suba o `.env` para o git.**

Gere uma chave JWT segura:
```bash
openssl rand -base64 48
```

---

## 2. Subir a aplicação

```bash
docker compose up -d --build
```

Aguarde ~1 minuto para a API iniciar. Acompanhe os logs:
```bash
docker compose logs -f api
```

Quando aparecer `Started AdvocaciaapiApplication`, tudo estará pronto.

---

## 3. Acessar

| O quê | URL |
|---|---|
| Site público | `http://SEU_IP` |
| Painel admin | `http://SEU_IP/login.html` |
| Swagger (docs da API) | `http://SEU_IP/swagger-ui/index.html` |

Login padrão: as credenciais definidas em `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`.

---

## Comandos úteis

```bash
# Ver logs em tempo real
docker compose logs -f

# Parar tudo
docker compose down

# Parar e apagar o banco (CUIDADO: apaga os dados!)
docker compose down -v

# Reconstruir só a API (após mudanças no código)
docker compose up -d --build api
```

---

## Deploy em servidor VPS (ex: DigitalOcean, AWS, Oracle Cloud)

1. Instale Docker no servidor
2. Clone ou envie os arquivos do projeto para o servidor
3. Configure o `.env`
4. `docker compose up -d --build`
5. (Opcional) Configure um domínio apontando para o IP do servidor e adicione SSL com [Certbot](https://certbot.eff.org/)

---

## Estrutura dos containers

```
frontend (Nginx :80)
    ├─ serve os arquivos de Site/
    └─ proxy /api/* ──► api (Spring Boot :8080)
                              └─ conecta ──► db (PostgreSQL :5432)
```
