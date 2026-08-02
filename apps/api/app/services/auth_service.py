from fastapi import HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repo import UserRepository, RefreshTokenRepository
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, hash_token, generate_reset_token
from app.services.audit_service import AuditService
from uuid import UUID
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)
_reset_tokens = {}

class AuthService:
    @staticmethod
    async def register(db: AsyncSession, email: str, password: str, full_name: str, role: str = 'analyst', request: Request = None):
        existing = await UserRepository.get_by_email(db, email)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        
        pwd_hash = hash_password(password)
        user = await UserRepository.create(db, email, pwd_hash, full_name, role)
        await AuditService.log(db, user.id, AuditService.ACTIONS.USER_REGISTERED, 'User', str(user.id), request=request)
        return user

    @staticmethod
    async def login(db: AsyncSession, email: str, password: str, request: Request = None):
        user = await UserRepository.get_by_email(db, email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
        
        access_token = create_access_token({'sub': str(user.id)})
        refresh_token = create_refresh_token({'sub': str(user.id)})
        
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        await RefreshTokenRepository.create_token(db, user.id, hash_token(refresh_token), expires_at)
        
        await UserRepository.update(db, user.id, last_login_at=datetime.now(timezone.utc))
        await AuditService.log(db, user.id, AuditService.ACTIONS.USER_LOGGED_IN, request=request)
        
        return user, access_token, refresh_token

    @staticmethod
    async def refresh_token(db: AsyncSession, refresh_token_str: str):
        from app.core.security import decode_token
        payload = decode_token(refresh_token_str)
        user_id_str = payload.get('sub')
        if not user_id_str:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        token_hash = hash_token(refresh_token_str)
        stored_token = await RefreshTokenRepository.get_by_hash(db, token_hash)
        if not stored_token or stored_token.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
        
        import uuid
        user_id = uuid.UUID(user_id_str)
        
        await RefreshTokenRepository.revoke(db, stored_token.id)
        
        new_access_token = create_access_token({'sub': str(user_id)})
        new_refresh_token = create_refresh_token({'sub': str(user_id)})
        
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        await RefreshTokenRepository.create_token(db, user_id, hash_token(new_refresh_token), expires_at)
        
        return new_access_token, new_refresh_token

    @staticmethod
    async def logout(db: AsyncSession, user_id: UUID, refresh_token_str: str, request: Request = None):
        if refresh_token_str:
            token_hash = hash_token(refresh_token_str)
            stored_token = await RefreshTokenRepository.get_by_hash(db, token_hash)
            if stored_token:
                await RefreshTokenRepository.revoke(db, stored_token.id)
        await AuditService.log(db, user_id, AuditService.ACTIONS.USER_LOGGED_OUT, request=request)

    @staticmethod
    async def forgot_password(db: AsyncSession, email: str, request: Request = None):
        user = await UserRepository.get_by_email(db, email)
        if user:
            token = generate_reset_token()
            _reset_tokens[token] = str(user.id)
            logger.info(f"Password reset token for {email}: {token}")
            await AuditService.log(db, user.id, AuditService.ACTIONS.PASSWORD_RESET_REQUESTED, request=request)
        return

    @staticmethod
    async def reset_password(db: AsyncSession, token: str, new_password: str):
        user_id_str = _reset_tokens.get(token)
        if not user_id_str:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
        
        import uuid
        user_id = uuid.UUID(user_id_str)
        pwd_hash = hash_password(new_password)
        await UserRepository.update(db, user_id, password_hash=pwd_hash)
        del _reset_tokens[token]
        await RefreshTokenRepository.revoke_all_for_user(db, user_id)
