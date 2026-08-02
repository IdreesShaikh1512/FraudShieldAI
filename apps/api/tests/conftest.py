import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from apps.api.app.main import app
from apps.api.app.core.database import get_db, Base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from apps.api.app.core.security import create_access_token
import uuid
import sys
import os

# Create async engine for tests
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

@pytest_asyncio.fixture(scope="session")
async def db_engine():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db(db_engine):
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture
async def client(db):
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def admin_headers():
    token = create_access_token({'sub': str(uuid.uuid4()), 'role': 'admin'})
    return {"Cookie": f"access_token={token}"}

@pytest.fixture
def analyst_headers():
    token = create_access_token({'sub': str(uuid.uuid4()), 'role': 'analyst'})
    return {"Cookie": f"access_token={token}"}

@pytest.fixture
def auditor_headers():
    token = create_access_token({'sub': str(uuid.uuid4()), 'role': 'auditor'})
    return {"Cookie": f"access_token={token}"}
