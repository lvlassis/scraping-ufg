from scrapy.crawler import Crawler


class RawCookieMiddleware:
    """Injeta o Cookie header raw em todos os requests do spider.

    Cobre o request original e qualquer redirect criado pelo RedirectMiddleware,
    já que novos requests voltam do início da chain de process_request.
    """

    crawler: Crawler

    @classmethod
    def from_crawler(cls, crawler):
        obj = cls()
        obj.crawler = crawler
        return obj

    def process_request(self, request):
        raw_cookies = getattr(self.crawler.spider, "_raw_cookies", "")
        if raw_cookies:
            request.headers["Cookie"] = raw_cookies
        return None
