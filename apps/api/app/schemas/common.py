from pydantic import BaseModel, Field
from typing import Optional, List, Generic, TypeVar

T = TypeVar('T')

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None

class SuccessResponse(BaseModel):
    message: str
