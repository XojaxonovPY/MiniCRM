import os
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware import Middleware

from admin.app import admin
from apps import main_router, exception_handler
from db import engine
from db.config import Base
from db.seed import seed_database


# ==========================================
# 1. LIFESPAN (Ilova hayotiy sikli)
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database()
    yield
    await engine.dispose()


middlewares = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
]

app = FastAPI(
    title="Fast API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    middleware=middlewares
)


# ==========================================
# 3. HTTP CUSTOM MIDDLEWARE (Process Time)
# ==========================================
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f} sec"
    return response


app.include_router(main_router)
admin.mount_to(app)

# ==========================================
# 4. FRONTEND STATIC FILES & SPA SERVING
# ==========================================
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "dist")
FRONTEND_ASSETS = os.path.join(FRONTEND_DIST, "assets")

if os.path.exists(FRONTEND_ASSETS):
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS), name="assets")


@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
@app.api_route("/app", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_frontend():
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"status": "ok", "message": "MiniCRM Backend API is active. Build frontend via 'cd frontend && npm run build'"}


# ==========================================
# 5. SWAGGER OPENAPI SECURITY OVERRIDE
# ==========================================
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="My Super API",
        version="1.0.0",
        description="JWT Authentication bilan himoyalangan API",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    public_paths = [
        "/",
        "/app",
        "/login",
        "/user/register",
        "/auth/login",
        "/auth/user/register",
        "/auth/refresh",
        "/docs",
        "/redoc",
        "/openapi.json"
    ]

    for path, path_item in openapi_schema["paths"].items():
        if path not in public_paths:
            for operation in path_item.values():
                operation.setdefault("security", []).append({"BearerAuth": []})

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
exception_handler(app)
