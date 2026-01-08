# ⚙️ Configuration Guide

## 🔧 Fine-Tune Your Experience
Fine-tune your bot experience by adjusting the `.env` file.

### Environment Tweaks (.env)
Your bot's personality lives here:
- 🥸 `TOKEN`: Your bot's secret identity
- #️⃣ `PREFIX`: Default command starter (like `/` or `!`)
- 🗺️ `DEFAULT_LANGUAGE`: Start with `en` for English
- 🗃️ `DATABASE_URL`: Where data lives (see database section below)
- 👑 `OWNER_IDS`: Your admin IDs (array format)
- 🔗 `NODES`: Lavalink connection details

🕵️ Peek at `.env.example` for all options!

### Database Configuration
🧠 **Smart Detection**: Lavamusic supports multiple database backends, automatically resolving the database type from your `DATABASE_URL` format:

| 🔗 DATABASE_URL Format | 🗃️ Database Type | 💾 Driver | ✏️ Example |
|---------------------|---------------|--------|---------|
| (empty/not set) | PGLite | drizzle-orm/pglite | `""` |
| `postgres://...` | PostgreSQL | drizzle-orm/node-postgres | `postgres://user:pass@localhost:5432/db` |
| `postgresql://...` | PostgreSQL | drizzle-orm/node-postgres | `postgresql://user:pass@localhost:5432/db` |
| `sqlite:...` | SQLite | drizzle-orm/bun-sqlite | `sqlite:./lavamusic.db` |
| `file:./path.db` | SQLite | drizzle-orm/bun-sqlite | `file:./lavamusic.db` |
| `file:./path.sqlite` | SQLite | drizzle-orm/bun-sqlite | `file:./lavamusic.sqlite` |
| `file:./path.sqlite3` | SQLite | drizzle-orm/bun-sqlite | `file:./lavamusic.sqlite3` |
| `file:./path?mode=ro` | SQLite | drizzle-orm/bun-sqlite | `file:./lavamusic.db?mode=ro` |
| `file:./directory` | PGLite | drizzle-orm/pglite | `file:./lavamusic-pgdata` |

> [!NOTE]
[PGlite](https://pglite.dev/) is a WASM Postgres build packaged into a TypeScript client library that enables you to run Postgres in the browser, Node.js and Bun, with no need to install any other dependencies.

### 🐘 Why PGLite? (And not just SQLite?)

You might be wondering:  
*`Why PGlite? Isn't SQLite the standard for small/local bots?`*

That's a great question! While SQLite is amazing, PGlite offers a unique advantage for a project like Lavamusic:  
It allows us to use the power of PostgreSQL without the complexity of setting up a server.

Here is why we made it the default:

- **Postgres power, SQLite simplicity**  
  PGlite runs entirely in a folder on your computer (just like SQLite), but inside, it is a full PostgreSQL engine running via WASM. You get all the advanced features of Postgres with zero installation steps. It doesn't need a separate server, Docker container, or complex installation.

- **Seamless Scaling**  
  Start small with PGLite (file-based). If your bot grows to thousands of servers and you need a dedicated database cluster, you simply change the `DATABASE_URL` to a full PostgreSQL server. **No code changes required.** You don't need to rewrite queries or migrate data types.

In short: **It just works**. PGlite gives you the simplicity of a file-based database with the power and scalability of a full database.  
It's the modern, robust choice for bots that want to stay simple today but be ready for tomorrow.

## 🌋 Lavalink Customization
Tweak `Lavalink/application.yml` for audio sources, plugins, and tweaks.

## 📀 Music Sources Galore

💎 **Built-in Gems**: SoundCloud, Twitch, Bandcamp, Vimeo, NicoNico, and more.

🧩 **Plugin Power-Ups** (add these for ultimate variety):
- 🎵 YouTube, Spotify, Deezer, Apple Music: Grab [LavaSrc](https://github.com/topi314/LavaSrc)
- 👥 Endless more via community plugins.