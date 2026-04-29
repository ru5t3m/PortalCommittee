from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1 import admin, auth, public
from app.core.config import get_settings
from app.db.session import Base, engine
from app.models import entities  # noqa: F401


def create_app() -> FastAPI:
    settings = get_settings()
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title=settings.app_name, version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.cors_origins],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "*.gov.kz", "*"])

    app.include_router(public.router, prefix="/api/v1", tags=["public"])
    app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
    app.include_router(admin.router, prefix="/api/v1", tags=["admin"])

    @app.get("/health")
    def health():
        return {"status": "ok", "service": settings.app_name}

    return app


app = create_app()
