from typing import Annotated, TypeAlias

from fastapi import APIRouter, HTTPException, status, Body
from sqlalchemy import select
from starlette.responses import JSONResponse

from apps.depends import SessionDep, UserSession
from db.models import User
from schemas import RegisterSchema, TokenResponseSchema, LoginSchema, UserResponseSchema
from services.token import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token
)

router = APIRouter()

BodyStr: TypeAlias = Annotated[str, Body(embed=True)]


@router.post("/user/register", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
async def user_create(session: SessionDep, user: RegisterSchema):
    hashed_password = await get_password_hash(user.password)
    user_data = user.model_dump(exclude_unset=True)
    user_data["password"] = hashed_password
    new_user = await User.create(session, **user_data)
    await session.commit()
    return new_user


@router.post("/login", response_model=TokenResponseSchema)
async def login(session: SessionDep, data: LoginSchema) -> JSONResponse:
    stmt = select(User)
    if data.phone_number and data.email:
        stmt = stmt.where(User.phone_number == data.phone_number, User.email == data.email)
    elif data.email:
        stmt = stmt.where(User.email == data.email)
    elif data.phone_number:
        stmt = stmt.where(User.phone_number == data.phone_number)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have to enter phone number or email")

    result = await User.get_query(session, stmt)
    user = result.scalar_one_or_none()
    if not user or not await verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email,Phone number and Password do not match"
        )

    access_token = create_access_token(subject=str(user.id))
    refresh_token_ = create_refresh_token(subject=str(user.id))
    return JSONResponse({
        "access_token": access_token,
        "refresh_token": refresh_token_,
        "token_type": "bearer"
    })


@router.post("/refresh", response_model=TokenResponseSchema)
async def refresh_token(refresh_token_: BodyStr):
    payload = verify_token(refresh_token_)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    token_subject = payload["sub"]
    new_access_token = create_access_token(subject=token_subject)
    new_refresh_token = create_refresh_token(subject=token_subject)

    return JSONResponse({
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    })


@router.get("/users/me", response_model=UserResponseSchema)
async def read_users_me(current_user: UserSession):
    return current_user
