import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from app.api.routes import discente
from app.scraper.runner import run_spider_in_thread

os.environ.setdefault("SCRAPY_SETTINGS_MODULE", "app.scraper.settings")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Popula o cache ao iniciar a aplicação
    # run_spider_in_thread(NoticiasSpider)
    yield


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
