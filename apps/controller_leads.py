from fastapi import APIRouter, HTTPException, status, Depends
from fastapi_filter import FilterDepends
from sqlalchemy import select

from apps.depends import SessionDep, UserSession
from db.models import Lead
from schemas import LeadResponseSchema, LeadsResponseSchema
from schemas.filter import LeadFilter
from schemas.pagination import Pagination

router = APIRouter()


@router.get("/lead/list/", response_model=LeadsResponseSchema)
async def get_lead_list(
        session: SessionDep, user: UserSession, pagination: Pagination = Depends(),
        filter: LeadFilter = FilterDepends(LeadFilter)
) -> LeadsResponseSchema:
    stmt = select(Lead)
    stmt = filter.filter(stmt)
    stmt = (
        stmt.order_by(Lead.id.desc())
        .limit(pagination.limit)
        .offset(pagination.offset)
    )
    leads = await Lead.get_query(session, stmt)
    return LeadsResponseSchema(data=leads.scalars().all(), limit=pagination.limit, offset=pagination.offset)


@router.get("/get/lead/{pk}/", response_model=LeadResponseSchema | None)
async def get_one_lead(pk: int, session: SessionDep, user: UserSession) -> Lead | None:
    lead = await Lead.get(session, id=pk)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead
