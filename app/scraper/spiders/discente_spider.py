import scrapy
from scrapy.http import Response

from app.scraper.items import DiscenteItem

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


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

    def start_requests(self):
        yield scrapy.Request(self.start_urls[0], dont_filter=True)

    def _field(self, response: Response, label: str) -> str:
        return response.xpath(
            f'//td[normalize-space()="{label}"]/following-sibling::td[1]/text()'
        ).get("").strip()

    def _indice(self, response: Response, title: str) -> str:
        return response.xpath(
            f'//acronym[@title="{title}"]/parent::td/following-sibling::td[1]//div/text()'
        ).get("").strip()

    def parse(self, response: Response):
        discente = DiscenteItem()
        discente["nome"] = response.xpath('//span[@class="nome"]//b/text()').get("").strip()
        discente["matricula"] = self._field(response, "Matrícula:")
        discente["curso"] = self._field(response, "Curso:")
        discente["nivel"] = self._field(response, "Nível:")
        discente["status"] = self._field(response, "Status:")
        discente["email"] = self._field(response, "E-Mail:")
        discente["entrada"] = self._field(response, "Entrada:")
        discente["ip"] = self._indice(response, "Índice de Prioridade")
        discente["ti"] = self._indice(response, "Taxa de Integralização")
        discente["ta"] = self._indice(response, "Taxa de Aprovação")
        discente["qr"] = self._indice(response, "Quantidade de Reprovações por Falta")
        discente["mge"] = self._indice(response, "Média Global do Estudante")
        discente["mre"] = self._indice(response, "Média Relativa do Estudante")
        discente["pmf"] = self._indice(response, "Porcentual Médio de Frequência")
        discente["ch_exigida"] = response.xpath('//td[normalize-space()="CH. Exigida"]/following-sibling::td[1]/text()').get("").strip()
        discente["ch_cursada"] = response.xpath('//td[normalize-space()="CH. Cursada"]/following-sibling::td[1]/text()').get("").strip()
        yield discente
