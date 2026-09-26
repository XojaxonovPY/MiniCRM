import re
from typing import Optional

from pydantic import BaseModel, Field, EmailStr, model_validator


class LoginSchema(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[str] = None
    password: str

    @model_validator(mode="after")
    def validate_phone_number(self):
        if self.phone_number:
            if not self.phone_number.startswith("998"):
                return ValueError("Phone number must start with +998")
            self.phone_number = re.sub(r"\D", "", str(self.phone_number))
        return self


class RegisterSchema(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(max_length=20, min_length=8, default=None)
    password: str = Field(max_length=10, min_length=3)

    @model_validator(mode="after")
    def validate_phone_number(self):
        if self.phone_number:
            if not self.phone_number.startswith("998"):
                return ValueError("Phone number must start with +998")
            self.phone_number = re.sub(r"\D", "", str(self.phone_number))
        return self


class UserSchema(BaseModel):
    first_name: Optional[str] = None
    password: Optional[str] = None
    username: Optional[str] = None
