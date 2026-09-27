from typing import Optional

from fastapi_filter.contrib.sqlalchemy import Filter

from db.enum import UserStatus
from db.models import Lead


class LeadFilter(Filter):
    search: Optional[str] = None
    status: Optional[UserStatus] = None
    sorted_by: Optional[list[str]] = None

    class Constants(Filter.Constants):
        model = Lead
        search_field_name = "search"
        search_model_fields = ("email", "name", "phone_number")
        ordering_field_name = "sorted_by"
