PORT = 8005
HOST = localhost

.PHONY: mig upg down create admin run dev build-frontend test

mig:
	alembic revision --autogenerate -m "Create a baseline migrations"

# Bazani oxirgi versiyagacha yangilash
upg:
	alembic upgrade head

# Bazani boshlang'ich holatga qaytarish
down:
	alembic downgrade base

# Alembic-ni initsializatsiya qilish
create:
	alembic init migrations

# Gunicorn serverni ishga tushirish (Uvicorn workers bilan)
run:
	gunicorn -c gunicorn_conf.py main:app

# Lokal dasturlash uchun reload rejimida ishga tushirish
dev:
	uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontendni yig'ish (Build)
build-frontend:
	cd frontend && npm run build

# Testlarni ishga tushirish (Pytest)
test:
	pytest -v
