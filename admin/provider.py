import bcrypt
from fastapi import Request, Response
from starlette_admin.auth import AuthProvider, AdminUser
from starlette_admin.exceptions import FormValidationError, LoginFailed

from db.models import Admin


class UsernameAndPasswordProvider(AuthProvider):

    async def login(
            self,
            username: str,
            password: str,
            remember_me: bool,
            request: Request) -> Response | None:
        if len(username) < 3:
            """Form data validation"""
            raise FormValidationError(
                {"username": "Ensure username has at least 03 characters"}
            )
        admin: Admin | None = await Admin.check_admin(username=username)
        if admin and bcrypt.checkpw(password.encode('utf-8'), admin.password.encode('utf-8')):
            request.session.update({"user_id": admin.id, "username": username})
            return None
        raise LoginFailed("Login yoki parol noto'g'ri")

    async def authenticate(self, request: Request) -> AdminUser | None:
        username: str | None = request.session.get("username", None)
        admin = await Admin.check_admin(username=username)
        if admin:
            username = request.session["username"]
            request.state.user = username
            return AdminUser(username=username)
        return None

    async def logout(self, request: Request):
        request.session.clear()
        return None
