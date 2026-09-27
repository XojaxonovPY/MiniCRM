# MiniCRM Loyihasi Tahlili va To'liq Tizim Arxitekturasi

Ushbu hujjat **MiniCRM** loyihasining backend, **React Frontend**, **avtomatlashtirilgan testlar**, **Gunicorn production runner**, **Mock data seeder** hamda **Render.com deployment** sozlamalari haqida to'liq ma'lumot beradi.

---

## 1. Loyiha umumiy ko'rinishi

- **Nomi**: MiniCRM
- **Arxitektura**: Monolit API + Integratsiyalashgan React SPA (Single Page Application)
- **Backend**: FastAPI, SQLAlchemy 2.0 (Asyncio), SQLite (`aiosqlite`), PostgreSQL (`asyncpg`), Alembic, Starlette-Admin
- **Frontend**: React 18, Vite, Tailwind CSS (Dark Mode bilan), Lucide Icons, Fetch API Client (JWT interceptor bilan)
- **Runner**: Gunicorn (`gunicorn_conf.py`) + `uvicorn.workers.UvicornWorker`
- **Deployment**: Multi-stage Dockerfile + `render.yaml` (Render.com ga 1-click deploy)
- **Seeder**: `db/seed.py` (Server ishga tushganda avtomatik admin, xodim va 8 ta realistik leadlarni kiritadi)

---

## 2. Standart Foydalanuvchilar va Mock Datalar

Ilova ishga tushishi bilan [db/seed.py](file:///home/dev/PycharmProjects/MiniCRM/db/seed.py) avtomatik ishlaydi (idempotent, ma'lumotlar takrorlanmaydi):

| Foydalanuvchi | Email / Login | Parol | Roli | Imkoniyatlari |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@crm.com` | `admin123` | Bosh Administrator | Lead yaratish, ko'rish, tahrirlash, status o'zgartirish |
| **Menejer** | `menejer@crm.com` | `menejer123` | Oddiy xodim / Menejer | Leadlar ro'yxatini ko'rish, qidirish, filtrlash, detail ko'rish |
| **Starlette Admin** | `admin` | `admin123` | Admin Panel (`/admin`) | DB jadvallarini to'g'ridan-to'g'ri boshqarish |

### Mock Leadlar (8 ta):
- Har xil statuslar: `new`, `contacted`, `qualified`, `won`, `lost`.
- Har xil manbalar: `Instagram`, `Telegram`, `Veb-sayt`, `Tavsiya`, `Ko'cha reklamasi`, `Facebook`.
- Har bir lead uchun o'zgarishlar tarixi (`History` audit loglari).

---

## 3. Render.com ga Deploy qilish (Professional Docker Usuli)

Loyiha to'liq **Multi-stage Dockerfile** asosida tayyorlandi:
1. **1-bosqich (`node:20-alpine`)**: React frontend kodlarini o'rnatadi va `npm run build` orqali `/app/frontend/dist` papkasini tayyorlaydi.
2. **2-bosqich (`python:3.12-slim`)**: `uv` paket boshqaruvchisi orqali Python kutubxonalarini o'rnatadi, backend va 1-bosqichdagi frontend dist fayllarini birlashtiradi.
3. **Ishga tushirish**: `gunicorn -c gunicorn_conf.py main:app`.

### Render.com da sozlash:
1. GitHub reponi Render.com ga ulang.
2. Yangi **Web Service** oching va **Runtime: Docker** ni tanlang (yoki to'g'ridan-to'g'ri `render.yaml` Blueprint orqali ulang).
3. **Environment Variables**:
   - `SECRET_KEY`: ixtiyoriy 64-belgili satr (Render avtomatik yaratishi mumkin).
   - `ADMIN_PANEL_SECRET`: ixtiyoriy satr.
   - `DB_URL`: `sqlite+aiosqlite:///./test.db` (yoki Renderning bepul PostgreSQL manzilini: `postgresql+asyncpg://...` qilib qo'yishingiz mumkin).

---

## 4. Buyruqlar (Makefile)

```bash
# 1. Gunicorn production serverni ishga tushirish:
make run

# 2. Lokal dasturlash rejimida (Uvicorn reload bilan):
make dev

# 3. Barcha avtomatlashtirilgan testlarni ishga tushirish (16 ta test):
make test

# 4. Frontend kodlarini qayta yig'ish (Build):
make build-frontend

# 5. Starlette Admin panelni ishga tushirish:
make admin
```
