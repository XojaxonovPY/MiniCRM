# ==========================================
# Stage 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Python Backend & Production Image
# ==========================================
FROM python:3.12-slim
WORKDIR /app

# O'rnatish uchun zarur tizim paketlari
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Tezkor paket boshqaruvchisi UV-ni o'rnatish
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Bog'liqliklarni o'rnatish
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache

# Virtual environment yo'lini PATH ga qo'shish
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Backend kodlarini nusxalash
COPY . .

# 1-bosqichda tayyorlangan Frontend dist fayllarini ko'chirib o'tkazish
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Render porti
EXPOSE 8000

# Gunicorn orqali ishga tushirish (UvicornWorker va gunicorn_conf.py bilan)
CMD ["gunicorn", "-c", "gunicorn_conf.py", "main:app"]
