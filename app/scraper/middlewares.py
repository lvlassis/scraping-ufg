class RawCookieMiddleware:
    """Injeta o Cookie header raw em todos os requests do spider.

    Cobre o request original e qualquer redirect criado pelo RedirectMiddleware,
    já que novos requests voltam do início da chain de process_request.
    """

    def process_request(self, request, spider):
        raw_cookies = getattr(spider, "_raw_cookies", "")
        if raw_cookies:
            request.headers["Cookie"] = raw_cookies
        return None
