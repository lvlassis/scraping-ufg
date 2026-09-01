from scrapy.crawler import Crawler

from academic.scraper import store


class CachePipeline:
    crawler: Crawler

    @classmethod
    def from_crawler(cls, crawler):
        obj = cls()
        obj.crawler = crawler
        return obj

    def open_spider(self):
        self._buffer: list = []

    def process_item(self, item):
        self._buffer.append(dict(item))
        return item

    def close_spider(self):
        spider = self.crawler.spider
        assert spider is not None
        error = getattr(spider, "_close_reason", None)
        store.set_data(spider.name, self._buffer, error=error)
        spider.logger.info(f"{len(self._buffer)} itens salvos no cache para '{spider.name}'")
