import academic.scraper.store as store_module
from academic.scraper.store import get_data, set_data


def setup_function():
    store_module._store.clear()


class TestStore:
    def test_get_chave_inexistente_retorna_none(self):
        assert get_data("nao_existe") is None

    def test_set_e_get_roundtrip(self):
        set_data("discente", [{"nome": "João"}])
        result = get_data("discente")
        assert result is not None
        assert result["data"] == [{"nome": "João"}]

    def test_erro_none_por_padrao(self):
        set_data("discente", [])
        result = get_data("discente")
        assert result is not None
        assert result["error"] is None

    def test_set_com_erro_session_expired(self):
        set_data("discente", [], error="session_expired")
        result = get_data("discente")
        assert result is not None
        assert result["error"] == "session_expired"

    def test_set_com_erro_unexpected_page(self):
        set_data("discente", [], error="unexpected_page")
        result = get_data("discente")
        assert result is not None
        assert result["error"] == "unexpected_page"

    def test_updated_at_presente(self):
        set_data("discente", [])
        result = get_data("discente")
        assert result is not None
        assert "updated_at" in result

    def test_sobrescreve_dados_anteriores(self):
        set_data("discente", [{"nome": "João"}])
        set_data("discente", [{"nome": "Maria"}])
        result = get_data("discente")
        assert result is not None
        assert result["data"] == [{"nome": "Maria"}]

    def test_chaves_independentes(self):
        set_data("spider_a", [{"val": 1}])
        set_data("spider_b", [{"val": 2}])
        result_a = get_data("spider_a")
        result_b = get_data("spider_b")
        assert result_a is not None and result_a["data"] == [{"val": 1}]
        assert result_b is not None and result_b["data"] == [{"val": 2}]
