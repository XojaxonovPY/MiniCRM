from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from db.enum import UserStatus
from schemas import BaseSchema


class TokenResponseSchema(BaseModel):
    access_token: Optional[str]
    refresh_token: Optional[str]
    token_type: Optional[str] = "bearer"


class UserResponseSchema(BaseSchema):
    id: int
    full_name: str
    is_admin: bool


class LeadResponseSchema(BaseSchema):
    id: Optional[int]
    name: Optional[str]
    status: UserStatus
    note: Optional[str]
    source: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeadsResponseSchema(BaseModel):
    data: list[LeadResponseSchema]
    limit: int
    offset: int


class MessageResponseSchema(BaseModel):
    status: str
    message: str


class HistoryResponseSchema(BaseModel):
    id: int
    detail: str
    lead: LeadResponseSchema
    user: UserResponseSchema
    created_at: datetime
