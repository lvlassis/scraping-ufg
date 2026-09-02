import threading

from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

from academic.scraper import store


def run_spider_blocking(spider_cls, **kwargs) -> dict | None:
    def _run():
        process = CrawlerProcess(get_project_settings())
        process.crawl(spider_cls, **kwargs)
        process.start()

    thread = threading.Thread(target=_run)
    thread.start()
    thread.join()
    return store.get_data(spider_cls.name)
