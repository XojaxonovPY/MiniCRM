# 🚀 MiniCRM — Lead Management System

**MiniCRM** — kichik va o'rta bizneslar uchun mijozlar arizalari (leadlar) oqimini samarali boshqarish, xodimlar harakatini audit qilish va savdo voronkasini kuzatishga mo'ljallangan zamonaviy, yuqori unumdor CRM tizimi.

Ushbu platforma asinxron **FastAPI** arxitekturasi va zamonaviy **React 18** (Vite + Tailwind CSS) Single Page Application (SPA) integratsiyasi asosida qurilgan bo'lib, ishlab chiqarish muhitida (**Gunicorn + Uvicorn**) va bulutli platformalarda (**Render.com / Docker**) ishlashga to'liq tayyor.

---

## 📑 Mundarija

- [Imkoniyatlar](#-imkoniyatlar)
- [Texnologik Stak](#-texnologik-stak)
- [Tizim Arxitekturasi](#-tizim-arxitekturasi)
- [Loyiha Strukturasi](#-loyiha-strukturasi)
- [Standart Foydalanuvchilar (Mock Data)](#-standart-foydalanuvchilar-mock-data)
- [Lokal Ishga Tushirish](#-lokal-ishga-tushirish)
- [API Hujjatlari](#-api-hujjatlari)
- [Avtomatlashtirilgan Testlar](#-avtomatlashtirilgan-testlar)
- [Render.com ga Deploy Qilish](#-rendercom-ga-deploy-qilish)

---

## ✨ Imkoniyatlar

### 🎯 1. Leadlar Boshqaruvi
- **Lead yaratish**: Mijoz ismi, telefon raqami (+998 formati), email, ixtiyoriy manba (Instagram, Telegram, Sayt, Tavsiya va h.k.) va batafsil izoh.
- **5 bosqichli status**: `New` (Yangi) ➔ `Contacted` (Aloqada) ➔ `Qualified` (Saralangan) ➔ `Won` (Mijoz / Yutildi) yoki `Lost` (Yo'qotildi).
- **Tezkor status boshqaruvi**: Modal orqali bitta tugmani bosish bilan statusni bir zumda o'zgartirish.
- **To'liq tahrirlash**: Barcha maydonlarni o'zgartirish (inline edit).

### 🔍 2. Qidiruv, Filtrlash va Sahifalash
- **Debounced qidiruv**: Ism, telefon raqami yoki email bo'yicha serverga ortiqcha yuklama bermasdan tezkor qidiruv.
- **Status bo'yicha filtrlash**: Faqat kerakli bosqichdagi leadlarni saralab ko'rish.
- **Tartiblash (Sorting)**: Eng yangilari, eng eskilari yoki alifbo bo'yicha saralash.
- **Sahifalash (Pagination)**: Katta hajmdagi ma'lumotlarni qulay va tezkor yuklash.

### 🛡️ 3. Audit va Harakatlar Tarixi (History)
- Har bir lead yaratilganda yoki tahrirlanganda qaysi xodim tomonidan qachon va qaysi maydonlar o'zgartirilganligi `History` jadvalida xronologik vaqt chizig'ida (timeline) saqlanadi.

### 👥 4. Xavfsizlik va Rollar (RBAC)
- **Asinxron Bcrypt**: Parollarni xavfsiz xeshirlash.
- **JWT Autentifikatsiya**: `access_token` (5 kun) va `refresh_token` (7 kun) orqali avtomatlashtirilgan seans nazorati.
- **Ruxsatlar nazorati (Permissions)**:
  - **Admin**: Lead yaratish, status o'zgartirish, tahrirlash va xodimlarni boshqarish.
  - **Menejer**: Barcha leadlar ro'yxatini ko'rish, qidirish, filtrlash va batafsil ma'lumotlar bilan tanishish.

### 🎨 5. Zamonaviy Foydalanuvchi Interfeysi (UI/UX)
- **Qorong'u Rejim (Dark Mode)**: Tizim to'liq yorug' va qorong'u rejimlarni qo'llab-quvvatlaydi, sozlamalar `localStorage` da eslab qolinadi.
- **Statistika Kartalari (StatCards)**: Asosiy ko'rsatkichlarni vizual ko'rsatish va kartani bosish orqali tezkor filtrlash.
- **Moslashuvchan (Responsive)**: Mobil qurilmalar, planshet va kompyuterlar ekraniga to'liq moslashgan.

### ⚡ 6. Avtomatik Mock Ma'lumotlar (Seeder)
- Ilova birinchi marta ishga tushganda tizimga avtomatik tarzda admin, menejer hamda turli status va manbalarga ega **8 ta realistik lead** hamda ularning o'zgarishlar tarixi kiritiladi.

---

## 🛠 Texnologik Stak

| Qatlam | Texnologiyalar |
| :--- | :--- |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) (0.141.x), [Starlette](https://www.starlette.io/) (1.7.x) |
| **Server / Runner** | [Gunicorn](https://gunicorn.org/) (26.x) + [UvicornWorker](https://www.uvicorn.org/) |
| **ORM & Baza** | [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Asyncio), [aiosqlite](https://github.com/omnilib/aiosqlite) (SQLite), [asyncpg](https://github.com/MagicStack/asyncpg) (PostgreSQL) |
| **Migratsiya** | [Alembic](https://alembic.sqlalchemy.org/) (1.20.x) |
| **Validatsiya** | [Pydantic v2](https://docs.pydantic.dev/) (2.13.x), [fastapi-filter](https://github.com/arthurio/fastapi-filter) |
| **Xavfsizlik** | [PyJWT](https://pyjwt.readthedocs.io/), [bcrypt](https://pypi.org/project/bcrypt/) |
| **Admin Panel** | [Starlette-Admin](https://jowilf.github.io/starlette-admin/) (1.0.x) |
| **Frontend** | [React 18](https://react.dev/), [Vite 5](https://vitejs.dev/), [Tailwind CSS 3](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Testlash** | [Pytest](https://pytest.org/), [pytest-asyncio](https://github.com/pytest-dev/pytest-asyncio), [HTTPX](https://www.python-httpx.org/) |
| **Paket boshqaruvchi** | [uv](https://github.com/astral-sh/uv) (yoki standart `pip`) |
| **Konteynerlash** | Docker (Multi-stage build) |

---

## 🏗 Tizim Arxitekturasi

```
           ┌──────────────────────────────────────────┐
           │        Brauzer / Mijoz (Client)          │
           └────────────────────┬─────────────────────┘
                                │ HTTP / JSON
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Server (Port 8000)                 │
│                                                                 │
│  ┌───────────────────────┐           ┌───────────────────────┐  │
│  │     GET / (SPA)       │           │   REST API (/auth,    │  │
│  │   React Frontend      │           │     /controller)      │  │
│  └───────────┬───────────┘           └───────────┬───────────┘  │
│              │                                   │              │
│              │ (Static Assets)                   │ (JSON)       │
│              ▼                                   ▼              │
│  ┌───────────────────────┐           ┌───────────────────────┐  │
│  │   frontend/dist/      │           │  Pydantic Schemas     │  │
│  │   index.html, JS, CSS │           │  & JWT Auth Validator │  │
│  └───────────────────────┘           └───────────┬───────────┘  │
│                                                  │              │
│                                                  ▼              │
│                                      ┌───────────────────────┐  │
│                                      │  SQLAlchemy 2.0 Async │  │
│                                      │   (Manager / Models)  │  │
│                                      └───────────┬───────────┘  │
└──────────────────────────────────────────────────┼──────────────┘
                                                   │
                                                   ▼
                                      ┌────────────────────────┐
                                      │   Relational Database  │
                                      │ (SQLite / PostgreSQL)  │
                                      └────────────────────────┘
```

---

## 📂 Loyiha Strukturasi

```plaintext
MiniCRM/
├── admin/                     # Starlette-Admin sozlamalari va autentifikatsiyasi
│   ├── app.py                 # Admin panel konfiguratsiyasi
│   ├── provider.py            # UsernameAndPasswordProvider sessiya nazorati
│   └── settings.py            # CLI orqali admin yaratish yordamchisi
├── apps/                      # Biznes mantiq va API kontrollerlar
│   ├── __init__.py            # main_router yig'uvchi
│   ├── auth.py                # Ro'yxatdan o'tish, login, refresh va profil endpointlari
│   ├── controller_leads.py    # Leadlar CRUD, filtrlash va tarix endpointlari
│   ├── depends.py             # FastAPI dependency-lar (SessionDep, UserSession)
│   ├── exceptions_handler.py  # Xatoliklarni markazlashgan tutish
│   ├── permissions.py         # Huquqlarni tekshiruvchi sinf (PermissionChecker)
│   └── test.py                # 16 ta to'liq asinxron integratsion testlar
├── core/                      # Global konfiguratsiyalar
│   ├── env_path.py            # .env yo'lini aniqlash
│   └── settings.py            # Muhit o'zgaruvchilari (Settings)
├── db/                        # Ma'lumotlar bazasi qatlami
│   ├── __init__.py            # Engine va sessiya sozlamalari
│   ├── config.py              # Base, Manager (ActiveRecord CRUD) va Model
│   ├── enum.py                # UserStatus enumi (new, contacted, qualified, won, lost)
│   ├── exceptions.py          # DatabaseException
│   ├── models.py              # User, Lead, History va Admin jadvallari
│   ├── seed.py                # Mock ma'lumotlar seederi (avtomatik ishga tushadi)
│   └── sessions.py            # Asinxron DB sessiya boshqaruvi
├── frontend/                  # React 18 SPA Ilovasi
│   ├── dist/                  # Yig'ilgan tayyor statik fayllar
│   ├── src/
│   │   ├── api/               # API so'rovlari (client.js, auth.js, leads.js)
│   │   ├── context/           # AuthContext (sessiya) va ThemeContext (Dark Mode)
│   │   ├── components/        # UI komponentlar (Navbar, StatCards, FilterBar, Modallar)
│   │   ├── pages/             # Sahifalar (LoginPage, RegisterPage, DashboardPage)
│   │   ├── App.jsx            # Asosiy komponent
│   │   ├── main.jsx           # React DOM kirish nuqtasi
│   │   └── index.css          # Tailwind CSS
│   ├── package.json           # Frontend kutubxonalari
│   ├── tailwind.config.js     # Dark mode va dizayn sozlamalari
│   └── vite.config.js         # Vite konfiguratsiyasi
├── migrations/                # Alembic migratsiyalari
├── Dockerfile                 # Multi-stage production konteyner
├── gunicorn_conf.py           # Production server sozlamalari
├── Makefile                   # Qulay tezkor buyruqlar to'plami
├── pyproject.toml             # Python paketlar va loyiha konfiguratsiyasi
├── render.yaml                # Render.com Blueprint sozlamalari
└── main.py                    # Ilovaning kirish nuqtasi va statik integratsiya
```

---

## 🔑 Standart Foydalanuvchilar (Mock Data)

Loyiha ilk marotaba ishga tushirilganda ma'lumotlar bazasida avtomatik ravishda quyidagi foydalanuvchilar va 8 ta sinov leadlari paydo bo'ladi:

| Foydalanuvchi | Login / Email | Parol | Roli | Vazifasi |
| :--- | :--- | :--- | :--- | :--- |
| **Bosh Administrator** | `admin@crm.com` | `admin123` | `is_admin = True` | Lead yaratish, status o'zgartirish, tahrirlash |
| **CRM Menejeri** | `menejer@crm.com` | `menejer123` | `is_admin = False` | Leadlar ro'yxatini ko'rish, qidirish, filtrlash |
| **Starlette Admin** | `admin` | `admin123` | Admin Panel | `/admin` manzilida DB jadvallarini boshqarish |

---

## 💻 Lokal Ishga Tushirish

### Talablar
- **Python**: `>= 3.12`
- **Node.js**: `>= 18` (faqat frontend kodlariga o'zgartirish kiritish uchun)

### 1. Repozitoriyani klonlash
```bash
git clone https://github.com/XojaxonovPY/MiniCRM.git
cd MiniCRM
```

### 2. Virtual muhit va bog'liqliklarni o'rnatish
`uv` yordamida (tavsiya etiladi):
```bash
uv sync
```
yoki standart `pip` orqali:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

### 3. Muhit o'zgaruvchilari (`.env`)
Loyiha ildizida `.env` faylini yarating:
```env
DB_URL=sqlite+aiosqlite:///./test.db
SECRET_KEY=supersecretjwtkey1234567890abcdef
ADMIN_PANEL_SECRET=supersecretadminsessionkey987654
```

### 4. Serverni ishga tushirish

* **Gunicorn bilan (Production rejimi):**
  ```bash
  make run
  ```
* **Uvicorn bilan (Lokal dasturlash & Hot-reload):**
  ```bash
  make dev
  ```

Endi brauzerda oching:
- **Asosiy CRM tizimi**: [http://localhost:8000/](http://localhost:8000/)
- **Swagger API Hujjati**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Admin Panel**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## 📖 API Hujjatlari

Tizim ochiq OpenAPI 3.0 standarti asosida avtomatik interaktiv hujjatlarni taqdim etadi:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Asosiy Endpointlar Xaritasi

| Metod | Manzil | Tavsif | Kirish huquqi |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/user/register` | Yangi xodimni ro'yxatdan o'tkazish | Ochiq |
| `POST` | `/auth/login` | Tizimga kirish (email/telefon + parol) | Ochiq |
| `POST` | `/auth/refresh` | Yangi JWT token juftligini olish | Ochiq |
| `GET` | `/auth/users/me` | Joriy xodim profili | `Bearer Auth` |
| `GET` | `/controller/lead/list/` | Leadlar ro'yxati (search, status, sort, pagination) | `Bearer Auth` |
| `GET` | `/controller/get/lead/{id}/` | Bitta lead haqida to'liq ma'lumot | `Bearer Auth` |
| `POST` | `/controller/create/lead/` | Yangi lead qo'shish | `Bearer Auth` + **Admin** |
| `PATCH` | `/controller/update/lead/{id}/` | Lead ma'lumotlari yoki statusini tahrirlash | `Bearer Auth` + **Admin** |
| `GET` | `/controller/actions/history/{id}` | Lead bo'yicha harakatlar va o'zgarishlar tarixi | `Bearer Auth` |

---

## 🧪 Avtomatlashtirilgan Testlar

Loyiha uchun `apps/test.py` faylida **16 ta asinxron integratsion testlar** to'plami yozilgan.

Testlarni ishga tushirish uchun:
```bash
make test
```

Natija:
```plaintext
apps/test.py::test_user_register_success PASSED                          [  6%]
apps/test.py::test_user_register_duplicate_conflict PASSED               [ 12%]
apps/test.py::test_user_login_with_email PASSED                          [ 18%]
apps/test.py::test_user_login_with_phone PASSED                          [ 25%]
apps/test.py::test_user_login_invalid_password PASSED                    [ 31%]
apps/test.py::test_refresh_token PASSED                                  [ 37%]
apps/test.py::test_get_current_user_me PASSED                            [ 43%]
apps/test.py::test_get_current_user_unauthorized PASSED                  [ 50%]
apps/test.py::test_create_lead_forbidden_for_regular_user PASSED         [ 56%]
apps/test.py::test_create_lead_success_for_admin PASSED                  [ 62%]
apps/test.py::test_get_lead_list PASSED                                  [ 68%]
apps/test.py::test_lead_list_search_and_status_filter PASSED             [ 75%]
apps/test.py::test_get_single_lead PASSED                                [ 81%]
apps/test.py::test_get_single_lead_not_found PASSED                      [ 87%]
apps/test.py::test_update_lead_by_admin PASSED                           [ 93%]
apps/test.py::test_lead_history_audit PASSED                             [100%]

============================== 16 passed in 3.6s ==============================
```

---

## ☁️ Render.com ga Deploy Qilish

Loyihada **Multi-stage Dockerfile** va **`render.yaml`** mavjudligi sababli uni Render platformasida bir zumda ishga tushirish mumkin:

1. Repozitoriyani GitHub-ga yuklang.
2. [Render.com Dashboard](https://dashboard.render.com/) ga kiring.
3. **New +** ➔ **Blueprints** ni tanlang va GitHub reponi ulang (u avtomatik ravishda `render.yaml` faylini aniqlaydi).
4. Yoki qo'lda **New Web Service** ochib:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Environment Variables**:
     - `SECRET_KEY`: ixtiyoriy maxfiy satr
     - `ADMIN_PANEL_SECRET`: ixtiyoriy maxfiy satr
     - `DB_URL`: `sqlite+aiosqlite:///./test.db` (yoki Renderning bepul PostgreSQL havolasi: `postgresql+asyncpg://...`)
5. **Create Web Service** tugmasini bosing — Render avtomatik ravishda React frontendni yig'adi, Python backendni sozlaydi va Gunicorn orqali ishga tushiradi!
6. **Render Url** -> https://minicrm-pypy.onrender.com/
---

## 👨‍💻 Muallif

- **Developer**: Dev
- **Email**: asqarservis00001@gmail.com
- **Litsenziya**: MIT
