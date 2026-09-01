from academic.db import init_db, save_snapshot
from academic.runner import run_spider_blocking
from academic.scraper.spiders.discente_spider import DiscenteSpider


class AcademicService:
    def __init__(self, cookies: str):
        self._cookies = cookies

    def update(self) -> dict:
        init_db()
        result = run_spider_blocking(DiscenteSpider, cookies=self._cookies)

        if not result or result.get("error"):
            error = result.get("error") if result else "sem dados"
            raise RuntimeError(f"Erro no scraping: {error}")

        items = result.get("data", [])
        if not items:
            raise RuntimeError("Nenhum dado retornado pelo scraper")

        data = items[0]
        save_snapshot(data)
        return data
