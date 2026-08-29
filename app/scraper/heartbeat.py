import asyncio
import logging
import os
import urllib.error
import urllib.request

from app.scraper import USER_AGENT

logger = logging.getLogger(__name__)

_SIGAA_URL = "https://sigaa.sistemas.ufg.br/sigaa/portais/discente/discente.jsf"
_INTERVAL = int(os.getenv("HEARTBEAT_INTERVAL", 30 * 60))  # segundos
_DEBUG = os.getenv("DEBUG", "").lower() == "true"


def _ping(cookies: str) -> bool:
    req = urllib.request.Request(
        _SIGAA_URL,
        headers={"Cookie": cookies, "User-Agent": USER_AGENT},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return "expirada" not in resp.url
    except urllib.error.URLError:
        return False


async def heartbeat_loop():
    cookies_definido = bool(os.getenv("SIGAA_COOKIES", ""))
    logger.info(
        "Heartbeat iniciado | intervalo: %ds | SIGAA_COOKIES: %s%s",
        _INTERVAL,
        "definido" if cookies_definido else "NÃO definido",
        " | modo DEBUG ativo" if _DEBUG else "",
    )

    iteration = 0
    while True:
        try:
            await asyncio.sleep(_INTERVAL)
            iteration += 1
            cookies = os.getenv("SIGAA_COOKIES", "")
            if not cookies:
                logger.warning("Heartbeat #%d: SIGAA_COOKIES não definido, pulando ping", iteration)
                continue
            if _DEBUG:
                logger.debug("Heartbeat #%d: iniciando ping para %s", iteration, _SIGAA_URL)
            alive = await asyncio.to_thread(_ping, cookies)
            if alive:
                logger.info("Heartbeat #%d: sessão SIGAA ativa", iteration)
            else:
                logger.warning("Heartbeat #%d: sessão SIGAA expirada ou inacessível", iteration)
        except asyncio.CancelledError:
            logger.info("Heartbeat encerrado")
            raise
        except Exception:
            logger.exception("Heartbeat #%d: erro inesperado, continuando", iteration)
