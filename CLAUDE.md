# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make dev          # inicia o servidor FastAPI com hot-reload
make fetch URL=https://exemplo.com [COOKIES='nome=valor; nome2=valor2']
                  # faz HTTP fetch de uma URL e salva o HTML em html_samples/
```

Testar seletores XPath/CSS contra um HTML salvo localmente (sem fazer request):
```bash
.venv/bin/scrapy shell html_samples/arquivo.html
```

## Arquitetura

O projeto expõe uma API FastAPI que entrega dados via web scraping do SIGAA UFG.

**Fluxo de dados:**
1. Rota FastAPI recebe request → extrai cookies de `X-SIGAA-Cookies` header ou `SIGAA_COOKIES` do `.env`
2. Instancia o spider e chama `run_spider_in_thread()` → `thread.join()` (bloqueante)
3. Spider roda via `CrawlerProcess` em thread separada (o Twisted emite warnings de signal handler mas funciona)
4. `CachePipeline` coleta os items e os salva em `store` (dict em memória, chaveado por `spider.name`)
5. Rota lê `store.get_data(spider.name)` e retorna o resultado

**Spiders autenticadas no SIGAA:**

O Twisted (engine HTTP do Scrapy) formata requests de forma que o SIGAA rejeita como bot (redirect 302 → `expirada.jsp`). A solução está em `app/scraper/middlewares.py`:

- `RawCookieMiddleware` injeta o Cookie header como string raw em `process_request`, cobrindo tanto o request original quanto qualquer request criado pelo `RedirectMiddleware` ao seguir redirects
- Todo spider autenticado deve usar estas `custom_settings`:

```python
custom_settings = {
    "HTTPCACHE_ENABLED": False,   # nunca usar cache de sessão anterior
    "ROBOTSTXT_OBEY": False,      # evita request extra que pode trigger detecção de bot
    "COOKIES_ENABLED": False,     # desabilita CookiesMiddleware (transforma valores URL-encoded)
    "USER_AGENT": "Mozilla/5.0 ...",
    "DOWNLOADER_MIDDLEWARES": {
        "app.scraper.middlewares.RawCookieMiddleware": 100,
    },
}
```

- O spider deve expor `self._raw_cookies: str` (string raw do header Cookie)
- **Não usar** `cookies=dict` no `scrapy.Request` — o `CookiesMiddleware` decodifica valores URL-encoded (`%3D%3D` → `==`), quebrando o HMAC do `_ufg_br_sess`
- **Não usar** `headers={"Cookie": ...}` com `dont_merge_cookies=True` — o header não é propagado para requests criados por redirect

**Cookies SIGAA:**

O SIGAA exige dois cookies juntos: `_ufg_br_sess` (sessão Rails) e `JSESSIONID` (sessão Java/JSF). Configurar no `.env`:
```
SIGAA_COOKIES=_ufg_br_sess=...; JSESSIONID=...
```

As rotas leem de `X-SIGAA-Cookies` header (não `Cookie`) para não conflitar com cookies de localhost enviados pelo browser durante desenvolvimento.

**Ferramenta de fetch para desenvolvimento:**

`scripts/fetch_html.py` usa urllib diretamente (não Scrapy) para salvar HTML em `html_samples/`. Útil para inspecionar a estrutura da página antes de escrever seletores.
