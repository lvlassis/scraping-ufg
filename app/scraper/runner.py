import asyncio
import logging

from scrapy.crawler import CrawlerRunner
from scrapy.utils.project import get_project_settings

logger = logging.getLogger(__name__)

_runner: CrawlerRunner | None = None


async def run_spider(spider_cls, **kwargs) -> None:
    global _runner
    if _runner is None:
        logger.debug("Instalando AsyncioSelectorReactor")
        from twisted.internet import asyncioreactor
        asyncioreactor.install(asyncio.get_running_loop())
        from twisted.internet import reactor as twisted_reactor
        twisted_reactor.startRunning(installSignalHandlers=False)
        logger.debug("Reactor iniciado")
        _runner = CrawlerRunner(get_project_settings())
        logger.debug("CrawlerRunner inicializado")
    logger.debug("Agendando crawl: %s", spider_cls.name)
    d = _runner.crawl(spider_cls, **kwargs)
    logger.debug("Aguardando conclusão do crawl via asFuture")
    await d.asFuture(asyncio.get_running_loop())
    logger.debug("Crawl concluído: %s", spider_cls.name)
