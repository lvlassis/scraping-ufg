from app.cache import store


class CachePipeline:
    def open_spider(self, spider):
        self._buffer: list = []

    def process_item(self, item, spider):
        self._buffer.append(dict(item))
        return item

    def close_spider(self, spider):
        store.set_data(spider.name, self._buffer)
        spider.logger.info(f"{len(self._buffer)} itens salvos no cache para '{spider.name}'")
