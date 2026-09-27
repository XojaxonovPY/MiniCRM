import os
import multiprocessing

# Server soket sozlamalari
port = os.getenv("PORT", "8000")
bind = f"0.0.0.0:{port}"

# Workerlar soni (Render bepul yoki kichik tariflari uchun xotira hisobga olingan)
workers_per_core = float(os.getenv("WORKERS_PER_CORE", "1"))
web_concurrency = os.getenv("WEB_CONCURRENCY", None)

if web_concurrency:
    workers = int(web_concurrency)
else:
    cores = multiprocessing.cpu_count()
    default_workers = max(int(workers_per_core * cores), 2)
    workers = min(default_workers, 4)

worker_class = "uvicorn.workers.UvicornWorker"

# Timeout va Keep-Alive
timeout = int(os.getenv("GUNICORN_TIMEOUT", "120"))
keepalive = int(os.getenv("GUNICORN_KEEPALIVE", "5"))

# Loglar
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("LOG_LEVEL", "info")
