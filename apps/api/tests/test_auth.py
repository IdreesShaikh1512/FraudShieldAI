import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@fraudshield.ai",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies
    data = response.json()
    assert data["email"] == "test@fraudshield.ai"
    assert data["role"] == "analyst"

@pytest.mark.asyncio
async def test_register_duplicate_email_409(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test2@fraudshield.ai",
            "password": "password123",
            "full_name": "Test User 2"
        }
    )
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test2@fraudshield.ai",
            "password": "password123",
            "full_name": "Test User 2"
        }
    )
    assert response.status_code == 409

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@fraudshield.ai",
            "password": "password123",
            "full_name": "Login User"
        }
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@fraudshield.ai",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies

@pytest.mark.asyncio
async def test_login_wrong_password_401(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@fraudshield.ai",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_protected_route_without_auth_401(client: AsyncClient):
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "logout@fraudshield.ai",
            "password": "password123",
            "full_name": "Logout User"
        }
    )
    cookies = reg.cookies
    response = await client.post("/api/v1/auth/logout", cookies=cookies)
    assert response.status_code == 200
