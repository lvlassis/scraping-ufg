import pytest
from scrapy.exceptions import CloseSpider
from scrapy.http import HtmlResponse

from app.scraper.spiders.discente_spider import (
    DiscenteSpider,
    _PAGE_MARKERS,
    _SESSION_EXPIRED_MARKER,
    _SMALL_PAGE_THRESHOLD,
)


def _resp(html: str) -> HtmlResponse:
    return HtmlResponse(url="http://test.local/", body=html.encode(), encoding="utf-8")


def _spider() -> DiscenteSpider:
    return DiscenteSpider()


# ── Etapa 4: _to_float ───────────────────────────────────────────────────────

class TestToFloat:
    def test_virgula_decimal(self):
        assert DiscenteSpider._to_float("8,5") == 8.5

    def test_ponto_decimal(self):
        assert DiscenteSpider._to_float("8.5") == 8.5

    def test_numero_inteiro(self):
        assert DiscenteSpider._to_float("10") == 10.0

    def test_string_invalida_retorna_none(self):
        assert DiscenteSpider._to_float("N/A") is None

    def test_vazio_retorna_none(self):
        assert DiscenteSpider._to_float("") is None


# ── Etapa 6: _slug ───────────────────────────────────────────────────────────

class TestSlug:
    def test_espacos_viram_hifen(self):
        assert DiscenteSpider._slug("Algoritmos e Programação") == "algoritmos-e-programacao"

    def test_acentos_removidos(self):
        assert DiscenteSpider._slug("Cálculo Diferencial") == "calculo-diferencial"

    def test_caracteres_especiais_removidos(self):
        assert DiscenteSpider._slug("Física I (Obrigatória)") == "fisica-i-obrigatoria"

    def test_espacos_nas_bordas_removidos(self):
        assert DiscenteSpider._slug("  Teoria dos Grafos  ") == "teoria-dos-grafos"


# ── Etapa 1: _check_response ─────────────────────────────────────────────────

class TestCheckResponse:
    def test_sessao_expirada_levanta_close_spider(self):
        html = f"<script>{_SESSION_EXPIRED_MARKER}\ndocument.location.href='/sigaa?modo=classico';</script>"
        assert len(html) < _SMALL_PAGE_THRESHOLD
        spider = _spider()
        with pytest.raises(CloseSpider) as exc:
            spider._check_response(_resp(html))
        assert exc.value.reason == "session_expired"
        assert spider._close_reason == "session_expired"

    def test_pagina_sem_nenhum_marker_levanta_close_spider(self):
        spider = _spider()
        with pytest.raises(CloseSpider) as exc:
            spider._check_response(_resp("<html><body>Página desconhecida</body></html>"))
        assert exc.value.reason == "unexpected_page"
        assert spider._close_reason == "unexpected_page"

    def test_pagina_com_markers_parciais_levanta_close_spider(self):
        spider = _spider()
        html = f"<html><body>{_PAGE_MARKERS[0]} {_PAGE_MARKERS[1]}</body></html>"
        with pytest.raises(CloseSpider) as exc:
            spider._check_response(_resp(html))
        assert exc.value.reason == "unexpected_page"

    def test_pagina_valida_nao_levanta(self):
        spider = _spider()
        html = f"<html><body>{' '.join(_PAGE_MARKERS)}</body></html>"
        spider._check_response(_resp(html))  # não deve levantar
        assert spider._close_reason is None

    def test_pagina_grande_com_marker_sessao_nao_e_expirada(self):
        # O marcador de sessão sozinho só dispara se o corpo for pequeno
        corpo_grande = "x" * _SMALL_PAGE_THRESHOLD + _SESSION_EXPIRED_MARKER
        spider = _spider()
        with pytest.raises(CloseSpider) as exc:
            spider._check_response(_resp(corpo_grande))
        assert exc.value.reason == "unexpected_page"  # não "session_expired"


# ── Etapa 2: _field ──────────────────────────────────────────────────────────

class TestField:
    HTML = """
    <table>
      <tr><td>Matrícula:</td><td>  202300001  </td></tr>
      <tr><td>Curso:</td><td>Ciência da Computação</td></tr>
    </table>
    """

    def test_campo_existente(self):
        assert _spider()._field(_resp(self.HTML), "Matrícula:") == "202300001"

    def test_whitespace_do_valor_removido(self):
        assert _spider()._field(_resp(self.HTML), "Matrícula:") == "202300001"

    def test_campo_ausente_retorna_vazio(self):
        assert _spider()._field(_resp(self.HTML), "Status:") == ""


# ── Etapa 3: _indice ─────────────────────────────────────────────────────────

class TestIndice:
    HTML = """
    <table>
      <tr>
        <td><acronym title="Índice de Prioridade">IP</acronym></td>
        <td><div>8,5</div></td>
      </tr>
      <tr>
        <td><acronym title="Taxa de Integralização">TI</acronym></td>
        <td><div>25,0</div></td>
      </tr>
    </table>
    """

    def test_indice_existente(self):
        assert _spider()._indice(_resp(self.HTML), "Índice de Prioridade") == "8,5"

    def test_segundo_indice(self):
        assert _spider()._indice(_resp(self.HTML), "Taxa de Integralização") == "25,0"

    def test_indice_ausente_retorna_vazio(self):
        assert _spider()._indice(_resp(self.HTML), "Índice Inexistente") == ""


# ── Etapa 5: _materias ───────────────────────────────────────────────────────

class TestMaterias:
    HTML = """
    <table>
      <thead><tr><th>Componente Curricular</th><th>Local</th><th>Horário</th></tr></thead>
      <tbody>
        <tr>
          <td><form><a href="#">Algoritmos e Programação</a></form></td>
          <td>AT4</td>
          <td><center>2M12345</center></td>
        </tr>
        <tr>
          <td><form><a href="#">Cálculo I</a></form></td>
          <td>IME</td>
          <td><center>3T34</center></td>
        </tr>
      </tbody>
    </table>
    """

    def test_chaves_sao_slugs_dos_nomes(self):
        result = _spider()._materias(_resp(self.HTML))
        assert "algoritmos-e-programacao" in result
        assert "calculo-i" in result

    def test_campos_de_cada_materia(self):
        result = _spider()._materias(_resp(self.HTML))
        materia = result["algoritmos-e-programacao"]
        assert materia["nome"] == "Algoritmos e Programação"
        assert materia["local"] == "AT4"
        assert materia["horario"] == "2M12345"

    def test_tabela_sem_linhas_retorna_vazio(self):
        html = """
        <table>
          <thead><tr><th>Componente Curricular</th></tr></thead>
          <tbody></tbody>
        </table>
        """
        assert _spider()._materias(_resp(html)) == {}

    def test_linha_sem_nome_e_ignorada(self):
        html = """
        <table>
          <thead><tr><th>Componente Curricular</th></tr></thead>
          <tbody>
            <tr><td></td><td>AT4</td><td><center>2M12</center></td></tr>
          </tbody>
        </table>
        """
        assert _spider()._materias(_resp(html)) == {}


# ── Etapa 7: parse (integração) ──────────────────────────────────────────────

_PAGINA_VALIDA = f"""
<html><body>
  {" ".join(_PAGE_MARKERS)}
  <span class="nome"><b>João da Silva</b></span>
  <table>
    <tr><td>Matrícula:</td><td>202300001</td></tr>
    <tr><td>Curso:</td><td>Ciência   da   Computação</td></tr>
    <tr><td>Nível:</td><td>Graduação</td></tr>
    <tr><td>Status:</td><td>Ativo</td></tr>
    <tr><td>E-Mail:</td><td>joao@ufg.br</td></tr>
    <tr><td>Entrada:</td><td>2023.1</td></tr>
    <tr><td>CH. Exigida</td><td>3200</td></tr>
    <tr><td>CH. Cursada</td><td>800</td></tr>
  </table>
  <table>
    <tr><td><acronym title="Índice de Prioridade">IP</acronym></td><td><div>8,5</div></td></tr>
    <tr><td><acronym title="Taxa de Integralização">TI</acronym></td><td><div>25,0</div></td></tr>
    <tr><td><acronym title="Taxa de Aprovação">TA</acronym></td><td><div>100,0</div></td></tr>
    <tr><td><acronym title="Quantidade de Reprovações por Falta">QRF</acronym></td><td><div>0</div></td></tr>
    <tr><td><acronym title="Média Global do Estudante">MGE</acronym></td><td><div>9,0</div></td></tr>
    <tr><td><acronym title="Média Relativa do Estudante">MRE</acronym></td><td><div>85,0</div></td></tr>
    <tr><td><acronym title="Porcentual Médio de Frequência">PMF</acronym></td><td><div>95,0</div></td></tr>
  </table>
  <table>
    <thead><tr><th>Componente Curricular</th><th>Local</th><th>Horário</th></tr></thead>
    <tbody>
      <tr>
        <td><form><a href="#">Algoritmos e Programação</a></form></td>
        <td>AT4</td>
        <td><center>2M12345</center></td>
      </tr>
    </tbody>
  </table>
</body></html>
"""


class TestParse:
    def test_retorna_um_item(self):
        items = list(_spider().parse(_resp(_PAGINA_VALIDA)))
        assert len(items) == 1

    def test_campos_texto(self):
        item = list(_spider().parse(_resp(_PAGINA_VALIDA)))[0]
        assert item["nome"] == "João da Silva"
        assert item["matricula"] == "202300001"
        assert item["nivel"] == "Graduação"
        assert item["status"] == "Ativo"
        assert item["entrada"] == "2023.1"

    def test_curso_com_espacos_extras_normalizado(self):
        item = list(_spider().parse(_resp(_PAGINA_VALIDA)))[0]
        assert item["curso"] == "Ciência da Computação"

    def test_email_com_arroba_recebe_dominio_discente_ufg(self):
        item = list(_spider().parse(_resp(_PAGINA_VALIDA)))[0]
        assert item["email"] == "joao@discente.ufg.br"

    def test_email_sem_arroba_fica_inalterado(self):
        html = _PAGINA_VALIDA.replace("joao@ufg.br", "joao.semdominio")
        item = list(_spider().parse(_resp(html)))[0]
        assert item["email"] == "joao.semdominio"

    def test_indices_convertidos_para_float(self):
        item = list(_spider().parse(_resp(_PAGINA_VALIDA)))[0]
        assert item["ip"] == 8.5
        assert item["ti"] == 25.0
        assert item["ta"] == 100.0
        assert item["qr"] == 0.0
        assert item["mge"] == 9.0
        assert item["mre"] == 85.0
        assert item["pmf"] == 95.0

    def test_ch_convertidas_para_int(self):
        item = list(_spider().parse(_resp(_PAGINA_VALIDA)))[0]
        assert item["ch_exigida"] == 3200
        assert item["ch_cursada"] == 800

    def test_materias_extraidas(self):
        item = list(_spider().parse(_resp(_PAGINA_VALIDA)))[0]
        assert "algoritmos-e-programacao" in item["materias"]
