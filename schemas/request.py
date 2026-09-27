from schemas.base import LeadBaseSchema, BaseSchema


class BaseAuthSchema(BaseSchema):
    password: str


class LoginSchema(BaseAuthSchema):
    pass


class RegisterSchema(BaseAuthSchema):
    full_name: str


class LeadRequestSchema(LeadBaseSchema):
    pass
