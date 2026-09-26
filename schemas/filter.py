from typing import Optional

from fastapi_filter.contrib.sqlalchemy import Filter

from db.models import User


class LeadFilter(Filter):
    search: Optional[str] = None

    class Constants(Filter.Constants):
        model = User
        search_field_name = "search"
        search_model_fields = ("email", "full_name", "phone_number")
