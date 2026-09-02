from academic.scraper import store


class CachePipeline:
    def open_spider(self, spider):
        self._buffer: list = []

    def process_item(self, item, spider):
        self._buffer.append(dict(item))
        return item

    def close_spider(self, spider):
        error = getattr(spider, "_close_reason", None)
        store.set_data(spider.name, self._buffer, error=error)
        spider.logger.info(f"{len(self._buffer)} itens salvos no cache para '{spider.name}'")
