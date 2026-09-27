from typing import Optional

from pydantic import Field, EmailStr, BaseModel

from schemas.base import LeadBaseSchema


class LoginSchema(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[str] = None
    password: str


class RegisterSchema(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(max_length=20, min_length=8, default=None)
    password: str = Field(max_length=10, min_length=3)


class LeadRequestSchema(LeadBaseSchema):
    pass
