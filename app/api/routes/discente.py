import logging
import os

from fastapi import APIRouter, HTTPException, Request

from app.cache import store
from app.scraper.runner import run_spider
from app.scraper.spiders.discente_spider import DiscenteSpider

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/discente", tags=["Discente"])


@router.get("/me")
async def me(request: Request):
    cookies = request.headers.get("x-sigaa-cookies") or os.getenv("SIGAA_COOKIES", "")
    if not cookies:
        raise HTTPException(
            status_code=401,
            detail="Cookie de sessão não informado. Defina SIGAA_COOKIES no .env ou passe o header X-SIGAA-Cookies.",
        )

    logger.debug("Iniciando run_spider para DiscenteSpider")
    await run_spider(DiscenteSpider, cookies=cookies)
    logger.debug("run_spider retornou, lendo store")

    result = store.get_data("discente")
    logger.debug("Store retornou: error=%s, data_len=%s", result.get("error") if result else "N/A", len(result["data"]) if result else 0)

    if result:
        error = result.get("error")
        if error == "session_expired":
            raise HTTPException(status_code=401, detail="Sessão SIGAA expirada. Atualize os cookies.")
        if error == "unexpected_page":
            raise HTTPException(status_code=502, detail="Erro de download não catalogado.")

    if not result or not result["data"]:
        raise HTTPException(status_code=503, detail="Não foi possível obter os dados.")

    return result["data"][0]
