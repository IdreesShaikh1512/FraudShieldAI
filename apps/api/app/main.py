from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import get_settings
from app.core.middleware import SecurityHeadersMiddleware, RequestLoggingMiddleware
from app.api.v1.router import router as v1_router
from app.core.database import init_db
from app.ml.inference import ml_service
from app.schemas.common import ErrorResponse
import logging
from contextlib import asynccontextmanager

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logging.info("Starting up FraudShield AI...")
    if settings.ENVIRONMENT == 'development':
        await init_db()
    ml_service.load_models()
    yield
    # Shutdown
    logging.info("Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise credit card fraud detection platform",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    contact={"name": "FraudShield Security Team"},
    license_info={"name": "Proprietary"}
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RequestLoggingMiddleware)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(detail=str(exc.errors()), code="VALIDATION_ERROR").model_dump()
    )

app.include_router(v1_router, prefix='/api/v1')

@app.get('/health', tags=['Meta'])
async def health():
    return {"status": "ok"}

@app.get('/ready', tags=['Meta'])
async def ready():
    return {"status": "ready", "models_loaded": ml_service.is_loaded}
