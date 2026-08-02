import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import hashlib
import secrets
from fastapi import HTTPException, status, Response
from app.core.config import get_settings

settings = get_settings()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials', headers={'WWW-Authenticate': 'Bearer'})

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode('utf-8')).hexdigest()

def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    is_prod = settings.ENVIRONMENT == 'production'
    response.set_cookie(
        'access_token', access_token,
        httponly=True,
        secure=is_prod,
        samesite='lax',
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path='/'
    )
    response.set_cookie(
        'refresh_token', refresh_token,
        httponly=True,
        secure=is_prod,
        samesite='lax',
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path='/'
    )

def clear_auth_cookies(response: Response):
    is_prod = settings.ENVIRONMENT == 'production'
    response.delete_cookie('access_token', httponly=True, secure=is_prod, samesite='lax', path='/')
    response.delete_cookie('refresh_token', httponly=True, secure=is_prod, samesite='lax', path='/')
