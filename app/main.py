import asyncio
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from app.api.routes import discente
from app.scraper.heartbeat import heartbeat_loop

os.environ.setdefault("SCRAPY_SETTINGS_MODULE", "app.scraper.settings")

def _setup_logging() -> None:
    debug = os.getenv("DEBUG", "").lower() == "true"
    level = logging.DEBUG if debug else logging.INFO
    app_logger = logging.getLogger("app")
    app_logger.setLevel(level)
    # O uvicorn só configura seus próprios loggers; o root logger fica sem handler.
    # Reutilizamos o handler do uvicorn para que logs de app.* apareçam no console.
    uvicorn_handlers = logging.getLogger("uvicorn").handlers
    if uvicorn_handlers:
        for handler in uvicorn_handlers:
            app_logger.addHandler(handler)
        app_logger.propagate = False


_setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(heartbeat_loop())
    yield
    task.cancel()


app = FastAPI(
    title="API Faculdade",
    description="Dados do site da faculdade via web scraping.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(discente.router)


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/cache/status")
def cache_status():
    return {}
