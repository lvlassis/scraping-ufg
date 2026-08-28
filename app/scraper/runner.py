import threading
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings


def _run_spider(spider_cls, **kwargs):
    process = CrawlerProcess(get_project_settings())
    process.crawl(spider_cls, **kwargs)
    process.start()


def run_spider_in_thread(spider_cls, **kwargs) -> threading.Thread:
    """Executa um spider em uma thread separada para não bloquear o FastAPI."""
    thread = threading.Thread(target=_run_spider, args=(spider_cls,), kwargs=kwargs, daemon=True)
    thread.start()
    return thread
