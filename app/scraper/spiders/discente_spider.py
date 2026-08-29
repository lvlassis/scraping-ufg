import re
import unicodedata

import scrapy
from scrapy.exceptions import CloseSpider
from scrapy.http import Response

from app.scraper import USER_AGENT
from app.scraper.items import DiscenteItem

_SESSION_EXPIRED_MARKER = "alert('Sua sessão foi expirada. É necessário autenticar-se novamente!');"
_PAGE_MARKERS = ["Componente Curricular", "Dados Institucionais", "Minhas atividades"]
_SMALL_PAGE_THRESHOLD = 500


class DiscenteSpider(scrapy.Spider):
    name = "discente"
    start_urls = ["https://sigaa.sistemas.ufg.br/sigaa/portais/discente/discente.jsf"]
    custom_settings = {
        "HTTPCACHE_ENABLED": False,
        "ROBOTSTXT_OBEY": False,
        "COOKIES_ENABLED": False,
        "USER_AGENT": USER_AGENT,
        "DOWNLOADER_MIDDLEWARES": {
            "app.scraper.middlewares.RawCookieMiddleware": 100,
        },
    }

    def __init__(self, cookies: str = "", *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._raw_cookies = cookies
        self._close_reason: str | None = None

    def start_requests(self):
        yield scrapy.Request(self.start_urls[0], dont_filter=True)

    def _field(self, response: Response, label: str) -> str:
        return response.xpath(
            f'//td[normalize-space()="{label}"]/following-sibling::td[1]/text()'
        ).get("").strip()

    @staticmethod
    def _to_float(value: str) -> float | None:
        try:
            return float(value.replace(",", "."))
        except ValueError:
            return None

    @staticmethod
    def _slug(text: str) -> str:
        text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
        text = re.sub(r"[^\w\s-]", "", text.lower())
        return re.sub(r"\s+", "-", text).strip("-")

    def _materias(self, response: Response) -> dict:
        rows = response.xpath(
            '//th[normalize-space()="Componente Curricular"]'
            '/ancestor::table[1]//tbody/tr'
        )
        result = {}
        for row in rows:
            nome = row.xpath('normalize-space(td[1]/form//a)').get("").strip()
            local = row.xpath('normalize-space(td[2])').get("").strip()
            horario = row.xpath('normalize-space(td[3]//center)').get("").strip()
            if nome:
                result[self._slug(nome)] = {"nome": nome, "local": local, "horario": horario}
        return result

    def _indice(self, response: Response, title: str) -> str:
        return response.xpath(
            f'//acronym[@title="{title}"]/parent::td/following-sibling::td[1]//div/text()'
        ).get("").strip()

    def _check_response(self, response: Response) -> None:
        body = response.text
        if len(body) < _SMALL_PAGE_THRESHOLD and _SESSION_EXPIRED_MARKER in body:
            self._close_reason = "session_expired"
            raise CloseSpider("session_expired")
        if not all(marker in body for marker in _PAGE_MARKERS):
            self._close_reason = "unexpected_page"
            self.logger.debug("Página inesperada (primeiros 500 chars): %.500s", body)
            raise CloseSpider("unexpected_page")

    def parse(self, response: Response):
        self._check_response(response)
        discente = DiscenteItem()
        discente["nome"] = response.xpath('//span[@class="nome"]//b/text()').get("").strip()
        discente["matricula"] = self._field(response, "Matrícula:")
        discente["curso"] = " ".join(self._field(response, "Curso:").split())
        discente["nivel"] = self._field(response, "Nível:")
        discente["status"] = self._field(response, "Status:")
        raw_email = self._field(response, "E-Mail:")
        discente["email"] = raw_email.split("@")[0] + "@discente.ufg.br" if "@" in raw_email else raw_email
        discente["entrada"] = self._field(response, "Entrada:")
        discente["ip"] = self._to_float(self._indice(response, "Índice de Prioridade"))
        discente["ti"] = self._to_float(self._indice(response, "Taxa de Integralização"))
        discente["ta"] = self._to_float(self._indice(response, "Taxa de Aprovação"))
        discente["qr"] = self._to_float(self._indice(response, "Quantidade de Reprovações por Falta"))
        discente["mge"] = self._to_float(self._indice(response, "Média Global do Estudante"))
        discente["mre"] = self._to_float(self._indice(response, "Média Relativa do Estudante"))
        discente["pmf"] = self._to_float(self._indice(response, "Porcentual Médio de Frequência"))
        discente["ch_exigida"] = int(v) if (v := response.xpath('//td[normalize-space()="CH. Exigida"]/following-sibling::td[1]/text()').get("").strip()).isdigit() else None
        discente["ch_cursada"] = int(v) if (v := response.xpath('//td[normalize-space()="CH. Cursada"]/following-sibling::td[1]/text()').get("").strip()).isdigit() else None
        discente["materias"] = self._materias(response)
        yield discente
