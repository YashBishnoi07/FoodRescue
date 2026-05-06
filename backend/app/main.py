import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .database import init_db, AsyncSessionLocal
from .config import settings
from .routers import auth, listings, claims, notifications, admin, messages
from .services.listing_service import expire_stale_listings

logger = structlog.get_logger()

scheduler = AsyncIOScheduler()


async def _run_expiry():
    async with AsyncSessionLocal() as db:
        await expire_stale_listings(db)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up Food Rescue API")
    await init_db()
    scheduler.add_job(_run_expiry, "interval", minutes=5, id="expiry_job")
    scheduler.start()
    yield
    # Shutdown
    scheduler.shutdown(wait=False)
    logger.info("Shutting down")


app = FastAPI(
    title="Food Rescue Platform API",
    description="Hyper-Local Food Rescue Platform — connect donors with receivers",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(claims.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(messages.router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "message": "Food Rescue Platform API is running"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}
