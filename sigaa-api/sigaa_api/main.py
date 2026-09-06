from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sigaa_scraper import SigaaScraper, SessionExpiredError, UnexpectedPageError

app = FastAPI(title="Academic Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/update")
def update(cookies: str):
    try:
        return SigaaScraper(cookies).get_discente()
    except SessionExpiredError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except UnexpectedPageError as e:
        raise HTTPException(status_code=502, detail=str(e))
