from fastapi import Query
from pydantic import BaseModel


class Pagination(BaseModel):
    limit: int = Query(20, ge=1, le=100)
    offset: int = Query(0, ge=0)

    @property
    def page(self) -> int:
        return (self.offset // self.limit) + 1
