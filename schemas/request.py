from typing import Optional

from db.enum import UserStatus
from schemas.base import BaseSchema


class BaseAuthSchema(BaseSchema):
    password: str


class LoginSchema(BaseAuthSchema):
    pass


class RegisterSchema(BaseAuthSchema):
    full_name: str


class LeadRequestSchema(BaseSchema):
    name: str
    note: str
    source: str


class LeadPatchRequestSchema(BaseSchema):
    name: Optional[str] = None
    note: Optional[str] = None
    status: Optional[UserStatus] = None
    source: Optional[str] = None
