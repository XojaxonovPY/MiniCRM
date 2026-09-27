import os
import sys
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from db.models import metadata, User
from db.sessions import get_session
from services.token import get_password_hash

DATABASE_URL = "sqlite+aiosqlite:///./pytest.db"
engine_test = create_async_engine(DATABASE_URL, echo=False)
TestSessionLocal = sessionmaker(bind=engine_test, class_=AsyncSession, expire_on_commit=False)


async def override_get_session():
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_session] = override_get_session


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(metadata.drop_all)
        await conn.run_sync(metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(metadata.drop_all)
    await engine_test.dispose()
    if os.path.exists("./pytest.db"):
        try:
            os.remove("./pytest.db")
        except OSError:
            pass


@pytest_asyncio.fixture(scope="session")
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture(scope="session")
async def regular_user(client):
    email = "manager@crm.com"
    password = "password123"
    phone_number = "998901111111"

    # Register regular user
    res = await client.post("/auth/user/register", json={
        "full_name": "Test Manager",
        "email": email,
        "phone_number": phone_number,
        "password": password
    })
    assert res.status_code == 201

    # Login
    login_res = await client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {
        "email": email,
        "password": password,
        "phone_number": phone_number,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }


@pytest_asyncio.fixture(scope="session")
async def admin_user(client):
    email = "admin@crm.com"
    password = "adminpassword"
    phone_number = "998902222222"

    hashed_pw = await get_password_hash(password)
    async with TestSessionLocal() as session:
        await User.create(
            session,
            full_name="Super Admin",
            email=email,
            phone_number=phone_number,
            password=hashed_pw,
            is_admin=True
        )
        await session.commit()

    login_res = await client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {
        "email": email,
        "password": password,
        "phone_number": phone_number,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }


# ==============================================================================
# 1. AUTHENTICATION & USER TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_user_register_success(client):
    response = await client.post("/auth/user/register", json={
        "full_name": "Jasur Aliyev",
        "email": "jasur@crm.com",
        "phone_number": "998903333333",
        "password": "mypassword"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "jasur@crm.com"
    assert data["full_name"] == "Jasur Aliyev"
    assert data["is_admin"] is False
    assert "password" not in data


@pytest.mark.asyncio
async def test_user_register_duplicate_conflict(client):
    # Try registering again with the same email
    response = await client.post("/auth/user/register", json={
        "full_name": "Jasur Duplicate",
        "email": "jasur@crm.com",
        "password": "mypassword"
    })
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_user_login_with_email(client):
    response = await client.post("/auth/login", json={
        "email": "jasur@crm.com",
        "password": "mypassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_user_login_with_phone(client):
    response = await client.post("/auth/login", json={
        "phone_number": "998903333333",
        "password": "mypassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_user_login_invalid_password(client):
    response = await client.post("/auth/login", json={
        "email": "jasur@crm.com",
        "password": "wrong_password"
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_refresh_token(client):
    login_res = await client.post("/auth/login", json={
        "email": "jasur@crm.com",
        "password": "mypassword"
    })
    refresh_token = login_res.json()["refresh_token"]

    response = await client.post("/auth/refresh", json={
        "refresh_token_": refresh_token
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_get_current_user_me(client, regular_user):
    response = await client.get("/auth/users/me", headers=regular_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == regular_user["email"]
    assert data["is_admin"] is False


@pytest.mark.asyncio
async def test_get_current_user_unauthorized(client):
    response = await client.get("/auth/users/me")
    assert response.status_code == 401


# ==============================================================================
# 2. LEAD MANAGEMENT (CRUD, FILTER, HISTORY) TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_create_lead_forbidden_for_regular_user(client, regular_user):
    # Regular users (non-admin) should receive 403 Forbidden
    response = await client.post("/controller/create/lead/", headers=regular_user["headers"], json={
        "name": "Mijoz 1",
        "phone_number": "998911112233",
        "source": "Instagram",
        "note": "Xizmat bilan qiziqmoqda"
    })
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_lead_success_for_admin(client, admin_user):
    response = await client.post("/controller/create/lead/", headers=admin_user["headers"], json={
        "name": "Bekzod Shukurov",
        "phone_number": "998905556677",
        "email": "bekzod@gmail.com",
        "source": "Telegram kanali",
        "note": "ERP va CRM tizimi kerak"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "created" in data["message"].lower()


@pytest.mark.asyncio
async def test_get_lead_list(client, regular_user):
    response = await client.get("/controller/lead/list/", headers=regular_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) >= 1
    assert data["limit"] == 20
    assert data["offset"] == 0

    first_lead = data["data"][0]
    assert first_lead["name"] == "Bekzod Shukurov"
    assert first_lead["status"] == "new"


@pytest.mark.asyncio
async def test_lead_list_search_and_status_filter(client, regular_user):
    # Search by name
    res_search = await client.get("/controller/lead/list/?search=Bekzod", headers=regular_user["headers"])
    assert res_search.status_code == 200
    assert len(res_search.json()["data"]) >= 1

    # Filter by status: new
    res_status = await client.get("/controller/lead/list/?status=new", headers=regular_user["headers"])
    assert res_status.status_code == 200
    assert len(res_status.json()["data"]) >= 1

    # Filter by non-existing status: won (should be 0)
    res_won = await client.get("/controller/lead/list/?status=won", headers=regular_user["headers"])
    assert res_won.status_code == 200
    assert len(res_won.json()["data"]) == 0


@pytest.mark.asyncio
async def test_get_single_lead(client, regular_user):
    # Get all to obtain ID
    list_res = await client.get("/controller/lead/list/", headers=regular_user["headers"])
    lead_id = list_res.json()["data"][0]["id"]

    response = await client.get(f"/controller/get/lead/{lead_id}/", headers=regular_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == lead_id
    assert data["name"] == "Bekzod Shukurov"
    assert data["source"] == "Telegram kanali"


@pytest.mark.asyncio
async def test_get_single_lead_not_found(client, regular_user):
    response = await client.get("/controller/get/lead/99999/", headers=regular_user["headers"])
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_lead_by_admin(client, admin_user, regular_user):
    list_res = await client.get("/controller/lead/list/", headers=regular_user["headers"])
    lead_id = list_res.json()["data"][0]["id"]

    # Patch status to contacted and update note
    response = await client.patch(
        f"/controller/update/lead/{lead_id}/",
        headers=admin_user["headers"],
        json={
            "status": "contacted",
            "note": "Mijoz bilan telefon orqali gaplashildi"
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Verify update
    lead_res = await client.get(f"/controller/get/lead/{lead_id}/", headers=regular_user["headers"])
    assert lead_res.json()["status"] == "contacted"
    assert lead_res.json()["note"] == "Mijoz bilan telefon orqali gaplashildi"


@pytest.mark.asyncio
async def test_lead_history_audit(client, regular_user):
    list_res = await client.get("/controller/lead/list/", headers=regular_user["headers"])
    lead_id = list_res.json()["data"][0]["id"]

    response = await client.get(f"/controller/actions/history/{lead_id}", headers=regular_user["headers"])
    assert response.status_code == 200
    history = response.json()
    # At least creation + update actions recorded
    assert len(history) >= 2
    details = [h["detail"] for h in history]
    assert any("created" in d.lower() for d in details)
    assert any("updated" in d.lower() for d in details)
