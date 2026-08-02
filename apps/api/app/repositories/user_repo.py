from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.models.user import User, RefreshToken
from typing import Optional, List
from uuid import UUID

class UserRepository:
    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == str(user_id)))
        return result.scalars().first()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    @staticmethod
    async def create(db: AsyncSession, email: str, password_hash: str, full_name: str, role: str = 'analyst') -> User:
        user = User(email=email, password_hash=password_hash, full_name=full_name, role=role)
        db.add(user)
        await db.flush()
        return user

    @staticmethod
    async def update(db: AsyncSession, user_id: UUID, **fields) -> Optional[User]:
        result = await db.execute(update(User).where(User.id == str(user_id)).values(**fields).returning(User))
        return result.scalars().first()

    @staticmethod
    async def list_users(db: AsyncSession, page: int, limit: int) -> tuple[List[User], int]:
        total = await db.scalar(select(func.count(User.id)))
        result = await db.execute(select(User).offset((page - 1) * limit).limit(limit))
        return list(result.scalars().all()), total or 0

class RefreshTokenRepository:
    @staticmethod
    async def create_token(db: AsyncSession, user_id: UUID, token_hash: str, expires_at) -> RefreshToken:
        token = RefreshToken(user_id=str(user_id), token_hash=token_hash, expires_at=expires_at)
        db.add(token)
        await db.flush()
        return token

    @staticmethod
    async def get_by_hash(db: AsyncSession, token_hash: str) -> Optional[RefreshToken]:
        result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash, RefreshToken.revoked == False))
        return result.scalars().first()

    @staticmethod
    async def revoke(db: AsyncSession, token_id: UUID) -> None:
        await db.execute(update(RefreshToken).where(RefreshToken.id == str(token_id)).values(revoked=True))

    @staticmethod
    async def revoke_all_for_user(db: AsyncSession, user_id: UUID) -> None:
        await db.execute(update(RefreshToken).where(RefreshToken.user_id == str(user_id), RefreshToken.revoked == False).values(revoked=True))
