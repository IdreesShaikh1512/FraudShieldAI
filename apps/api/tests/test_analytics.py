import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_kpis_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/dashboard/kpis")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_kpis_returns_valid_structure(client: AsyncClient):
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "analyst_kpi@fraudshield.ai",
            "password": "password123",
            "full_name": "Analyst KPI"
        }
    )
    
    response = await client.get("/api/v1/dashboard/kpis", cookies=reg_response.cookies)
    assert response.status_code == 200
    data = response.json()
    assert "total_transactions" in data
    assert "total_fraud" in data

@pytest.mark.asyncio
async def test_fraud_by_hour_returns_24_datapoints(client: AsyncClient):
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "analyst_hr@fraudshield.ai",
            "password": "password123",
            "full_name": "Analyst HR"
        }
    )
    
    response = await client.get("/api/v1/analytics/fraud-by-hour", cookies=reg_response.cookies)
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) == 24
