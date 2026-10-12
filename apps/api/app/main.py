from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1 import admin, attempts, auth, game, public, tests
from app.core.config import get_settings
from app.models import entities  # noqa: F401


def create_app() -> FastAPI:
    settings = get_settings()
    settings.validate_for_startup()

    app = FastAPI(title=settings.app_name, version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.cors_origins],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)

    @app.middleware("http")
    async def game_cache_policy(request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/api/v1/games/specgame/"):
            response.headers["Cache-Control"] = "private, no-store"
            response.headers["Pragma"] = "no-cache"
        return response

    app.include_router(public.router, prefix="/api/v1", tags=["public"])
    app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
    app.include_router(attempts.router, prefix="/api/v1", tags=["psychological-tests"])
    app.include_router(tests.router, prefix="/api/v1", tags=["psychological-tests"])
    app.include_router(admin.router, prefix="/api/v1", tags=["admin"])
    app.include_router(game.router, prefix="/api/v1", tags=["game"])

    @app.get("/health")
    def health():
        return {"status": "ok", "service": settings.app_name}

    return app


app = create_app()
