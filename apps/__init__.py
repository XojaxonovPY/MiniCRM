from fastapi import APIRouter

from apps.auth import router as auth
from apps.controller_leads import router as controller_leads
from apps.exceptions_handler import exception_handler

main_router = APIRouter()
main_router.include_router(auth, prefix="/auth", tags=["Auth"])
main_router.include_router(controller_leads, prefix="/controller", tags=["Controller"])
