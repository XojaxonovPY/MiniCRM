import re
from typing import Optional

from pydantic import BaseModel, model_validator, EmailStr, Field


class BaseSchema(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(max_length=20, min_length=8, default=None)

    @model_validator(mode="after")
    def validate_phone_number(self):
        if self.phone_number:
            if not self.phone_number.startswith("998"):
                raise ValueError("Phone number must start with +998")
            self.phone_number = re.sub(r"\D", "", str(self.phone_number))
        return self


class LeadBaseSchema(BaseSchema):
    name: str
    note: str
    source: str
