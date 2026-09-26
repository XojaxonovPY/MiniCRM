from sqlalchemy import String, CHAR, Enum, Boolean
from sqlalchemy.orm import mapped_column, Mapped

from db.config import Model, Base
from db.enum import UserStatus
from db.sessions import AsyncSessionLocal


class Admin(Model):
    username: Mapped[str] = mapped_column(CHAR(length=55))
    password: Mapped[str] = mapped_column(String(length=105))

    @staticmethod
    async def check_admin(**kwargs):
        async with AsyncSessionLocal() as session:
            obj = await Admin.get(session, **kwargs)
            return obj

    @staticmethod
    async def create_admin(**kwargs):
        async with AsyncSessionLocal() as session:
            obj = await Admin.create(session, **kwargs)
            return obj


values_callable = lambda obj: [e.value for e in obj]


class User(Model):
    full_name: Mapped[str] = mapped_column(String(length=50))
    phone_number: Mapped[str] = mapped_column(String(length=20), nullable=True, unique=True, index=True)
    email: Mapped[str] = mapped_column(String(length=100), nullable=True, unique=True, index=True)
    source: Mapped[str] = mapped_column(String(length=255), nullable=True)
    note: Mapped[str] = mapped_column(String(length=200), nullable=True)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, values_callable=values_callable), default=UserStatus.NEW.value, nullable=True
    )
    password: Mapped[str] = mapped_column(String(length=200))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)


metadata = Base.metadata
