from typing import Any

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi_filter import FilterDepends
from sqlalchemy import select

from apps.depends import SessionDep, UserSession
from apps.permissions import PermissionChecker
from db.models import Lead, History
from schemas import LeadResponseSchema, LeadsResponseSchema, MessageResponseSchema, LeadRequestSchema, \
    LeadPatchRequestSchema, HistoryResponseSchema
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
    stmt = filter.sort(stmt)
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


@router.post(
    "/create/lead/", response_model=MessageResponseSchema, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker())]
)
async def create_lead(session: SessionDep, user: UserSession, payload: LeadRequestSchema):
    lead = await Lead.create(session, **payload.model_dump(exclude_unset=True), creator_id=user.id)
    await History.create(session, user_id=user.id, lead_id=lead.id, detail="Leader is created")
    await session.commit()
    return MessageResponseSchema(status="success", message="Lead is created successfully")


@router.patch("/update/lead/{pk}/", response_model=MessageResponseSchema, dependencies=[Depends(PermissionChecker())])
async def update_lead(pk: int, session: SessionDep, user: UserSession, payload: LeadPatchRequestSchema):
    lead_data: dict[str, Any] = payload.model_dump(exclude_unset=True)
    lead = await Lead.update(session, filter_={"id": pk}, **lead_data)
    updated_fields = ", ".join(lead_data.keys())
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    await History.create(session, user_id=user.id, lead_id=lead.id, detail=f"Lead {updated_fields} are updated")
    await session.commit()
    return MessageResponseSchema(status="success", message="Lead is updated successfully")


@router.get("/actions/history/{pk}", response_model=list[HistoryResponseSchema])
async def get_history(session: SessionDep, user: UserSession, pk: int):
    history = await History.get_filter(session, History.lead_id == pk)
    return history
