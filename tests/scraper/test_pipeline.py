from unittest.mock import MagicMock, patch

from academic.scraper.pipelines import CachePipeline


def _make_crawler(name: str = "discente", close_reason: str | None = None):
    spider = MagicMock()
    spider.name = name
    spider._close_reason = close_reason

    crawler = MagicMock()
    crawler.spider = spider
    return crawler


class TestCachePipeline:
    def test_buffer_vazio_ao_abrir(self):
        pipeline = CachePipeline.from_crawler(_make_crawler())
        pipeline.open_spider()
        assert pipeline._buffer == []

    def test_process_item_acumula_no_buffer(self):
        pipeline = CachePipeline.from_crawler(_make_crawler())
        pipeline.open_spider()
        pipeline.process_item({"nome": "João"})
        pipeline.process_item({"nome": "Maria"})
        assert pipeline._buffer == [{"nome": "João"}, {"nome": "Maria"}]

    def test_process_item_retorna_o_proprio_item(self):
        pipeline = CachePipeline.from_crawler(_make_crawler())
        pipeline.open_spider()
        item = {"nome": "João"}
        assert pipeline.process_item(item) is item

    def test_open_spider_reinicia_buffer(self):
        pipeline = CachePipeline.from_crawler(_make_crawler())
        pipeline.open_spider()
        pipeline.process_item({"nome": "João"})
        pipeline.open_spider()
        assert pipeline._buffer == []

    def test_close_spider_salva_itens_sem_erro(self):
        pipeline = CachePipeline.from_crawler(_make_crawler())
        pipeline.open_spider()
        pipeline.process_item({"nome": "João"})

        with patch("academic.scraper.pipelines.store") as mock_store:
            pipeline.close_spider()
            mock_store.set_data.assert_called_once_with(
                "discente", [{"nome": "João"}], error=None
            )

    def test_close_spider_propaga_session_expired(self):
        pipeline = CachePipeline.from_crawler(_make_crawler(close_reason="session_expired"))
        pipeline.open_spider()

        with patch("academic.scraper.pipelines.store") as mock_store:
            pipeline.close_spider()
            mock_store.set_data.assert_called_once_with(
                "discente", [], error="session_expired"
            )

    def test_close_spider_propaga_unexpected_page(self):
        pipeline = CachePipeline.from_crawler(_make_crawler(close_reason="unexpected_page"))
        pipeline.open_spider()

        with patch("academic.scraper.pipelines.store") as mock_store:
            pipeline.close_spider()
            mock_store.set_data.assert_called_once_with(
                "discente", [], error="unexpected_page"
            )
