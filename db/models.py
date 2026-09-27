from sqlalchemy import String, CHAR, Enum, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship

from db.config import Model, Base, get_current_uzb_time
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
    password: Mapped[str] = mapped_column(String(length=200))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="creator", lazy="selectin")
    histories: Mapped[list["History"]] = relationship("History", back_populates="user", lazy="selectin")


class Lead(Model):
    name: Mapped[str] = mapped_column(String(length=100))
    source: Mapped[str] = mapped_column(String(length=255))
    phone_number: Mapped[str] = mapped_column(String(length=20), nullable=True, unique=True, index=True)
    email: Mapped[str] = mapped_column(String(length=100), nullable=True, unique=True, index=True)
    note: Mapped[str] = mapped_column(String(length=200))
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, values_callable=values_callable), default=UserStatus.NEW.value
    )
    updated_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), default=get_current_uzb_time, onupdate=get_current_uzb_time
    )
    creator: Mapped["User"] = relationship("User", back_populates="leads", lazy="joined")
    histories: Mapped[list["History"]] = relationship("History", back_populates="lead", lazy="selectin")


class History(Model):
    __tablename__ = "histories"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True)
    detail: Mapped[str] = mapped_column(String(length=100), nullable=True, unique=True, index=True)
    user: Mapped["User"] = relationship("User", back_populates="histories", lazy="joined")
    lead: Mapped["Lead"] = relationship("Lead", back_populates="histories", lazy="joined")


metadata = Base.metadata
