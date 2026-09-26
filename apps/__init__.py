from fastapi import APIRouter

from apps.auth import router as auth
from apps.exceptions_handler import exception_handler

main_router = APIRouter()
main_router.include_router(auth, prefix="/auth", tags=["Auth"])
