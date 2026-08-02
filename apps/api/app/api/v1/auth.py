from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, UserResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.common import SuccessResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.core.security import set_auth_cookies, clear_auth_cookies
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get('/me', response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return current_user

@router.post('/register', response_model=UserResponse)
@limiter.limit('5/minute')
async def register(request: Request, data: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user = await AuthService.register(db, data.email, data.password, data.full_name, request=request)
    _, access, refresh = await AuthService.login(db, data.email, data.password, request)
    set_auth_cookies(response, access, refresh)
    return user

@router.post('/login', response_model=UserResponse)
@limiter.limit('5/minute')
async def login(request: Request, data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user, access, refresh = await AuthService.login(db, data.email, data.password, request)
    set_auth_cookies(response, access, refresh)
    return user

@router.post('/refresh', response_model=SuccessResponse)
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get('refresh_token')
    if not refresh_token:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Refresh token missing")
    access, new_refresh = await AuthService.refresh_token(db, refresh_token)
    set_auth_cookies(response, access, new_refresh)
    return SuccessResponse(message="Tokens refreshed")

@router.post('/logout', response_model=SuccessResponse)
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    refresh_token = request.cookies.get('refresh_token')
    await AuthService.logout(db, current_user.id, refresh_token, request=request)
    clear_auth_cookies(response)
    return SuccessResponse(message="Logged out")

@router.post('/forgot-password', response_model=SuccessResponse)
@limiter.limit('3/minute')
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    await AuthService.forgot_password(db, data.email, request)
    return SuccessResponse(message="If email exists, a reset link was sent")

@router.post('/reset-password', response_model=SuccessResponse)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    await AuthService.reset_password(db, data.token, data.new_password)
    return SuccessResponse(message="Password updated")
