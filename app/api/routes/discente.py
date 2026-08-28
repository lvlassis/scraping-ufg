import os

from fastapi import APIRouter, HTTPException, Request

from app.cache import store
from app.scraper.runner import run_spider_in_thread
from app.scraper.spiders.discente_spider import DiscenteSpider

router = APIRouter(prefix="/discente", tags=["Discente"])


@router.get("/me")
def me(request: Request):
    cookies = request.headers.get("x-sigaa-cookies") or os.getenv("SIGAA_COOKIES", "")
    if not cookies:
        raise HTTPException(
            status_code=401,
            detail="Cookie de sessão não informado. Defina SIGAA_COOKIES no .env ou passe o header X-SIGAA-Cookies.",
        )

    thread = run_spider_in_thread(DiscenteSpider, cookies=cookies)
    thread.join()

    result = store.get_data("discente")
    if not result or not result["data"]:
        raise HTTPException(status_code=503, detail="Não foi possível obter os dados")

    return result["data"][0]
