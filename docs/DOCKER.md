## 🐳 Docker Lovers' Shortcut (One-Click Setup!)

Prefer containers? We've got you! Docker automatically handles database setup and keeps your environment clean.

Our setup uses **Docker Compose Profiles**, allowing you to choose exactly which services to run based on your needs.

## 🚀 Setup

### 1. 📥 Prerequisites:
- Install [Docker](https://docs.docker.com/get-started/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install) if you haven't.  

### 2. ⚙️ Configuration:
- Copy the template files:

   ```bash
   cp .env.example .env
   cp Lavalink/example.application.yml Lavalink/application.yml
   ```

### 3. 🚀 Choose Services

#### 🟢 Standard (Bot + Local Lavalink node)
**Recommended for most users.**  
Uses `PGLite` and hosts `Lavalink` locally.

```bash
docker compose --profile lavalink up -d
```

#### 🟡 Lightweight (Bot only)
Use this if you already have an external `Lavalink` node hosted elsewhere.

> [!IMPORTANT]
> **You must configure the Postgres `DATABASE_URL` in `compose.yaml` or set it in `.env`.**
**Edit `.env` to set your external `NODES` first.**

```bash
docker compose up -d
```

#### 🔴 Full (Bot + Lavalink + PostgreSQL)
**Recommended for large shards.**  
Runs a dedicated `PostgreSQL` container alongside the bot and `Lavalink`.  

> [!IMPORTANT]
**You must configure the Postgres `DATABASE_URL` in `compose.yaml` or set it in `.env`.**
```bash
docker compose --profile all up -d
```

🎉 Boom! Bot, Lavalink, and PostgreSQL database—all running automatically with no extra setup needed!

### ⬆️ Want to update later?
>[!IMPORTANT]
Use the same profile flag you used during startup (e.g., `--profile lavalink`)
```bash
docker compose pull
docker compose up -d --force-recreate
```

> [!NOTE]
> If you prefer **SQLite** or **PGLite** with Docker, you need to run database setup commands manually before starting Docker.
> 
> Ensure your `DATABASE_URL` points to the persistent volume:
> - **PGLite:** `DATABASE_URL="file:./lavamusic-pgdata"` (Default)
> - **SQLite:** `DATABASE_URL="file:./lavamusic.db"`