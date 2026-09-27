from typing import Any

import bcrypt
from starlette.middleware import Middleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request
from starlette_admin.contrib.sqla import Admin, ModelView

from admin.provider import UsernameAndPasswordProvider
from core.settings import Settings
from db import engine
from db.models import Admin as AdminModel

secret_key = Settings.ADMIN_PANEL_SECRET
admin = Admin(
    engine,
    title='Mini CRM Admin',
    base_url='/admin/',
    auth_provider=UsernameAndPasswordProvider(),
    secret_key=secret_key,
    middlewares=[Middleware(SessionMiddleware, secret_key=secret_key)]
)


class AdminModelView(ModelView):
    fields = [AdminModel.id, AdminModel.username]

    async def before_create(self, request: Request, data: dict[str, Any], obj: Any) -> None:
        if data.get("password"):
            password = str(data.get("password")).encode('utf-8')
            obj.password = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')


# user_model = UserModelView(User)
admin_model = AdminModelView(AdminModel)

admin.add_view(admin_model)
# admin.add_view(user_model)
