import re

from pydantic import BaseModel, model_validator, EmailStr

from db.enum import UserStatus


class LeadBaseSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone_number: str
    status: UserStatus
    note: str
    source: str

    @model_validator(mode="after")
    def validate_phone_number(self):
        if self.phone_number:
            if not self.phone_number.startswith("998"):
                return ValueError("Phone number must start with +998")
            self.phone_number = re.sub(r"\D", "", str(self.phone_number))
        return self
