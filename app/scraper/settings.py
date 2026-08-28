BOT_NAME = "turing"

SPIDER_MODULES = ["app.scraper.spiders"]
NEWSPIDER_MODULE = "app.scraper.spiders"

ROBOTSTXT_OBEY = True

# Intervalo entre requisições (segundos) — evita sobrecarregar o servidor
DOWNLOAD_DELAY = 1
RANDOMIZE_DOWNLOAD_DELAY = True

ITEM_PIPELINES = {
    "app.scraper.pipelines.CachePipeline": 300,
}

# Cache HTTP: evita re-baixar páginas durante desenvolvimento
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 3600
HTTPCACHE_DIR = ".scrapy_cache"

REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"

LOG_LEVEL = "INFO"
