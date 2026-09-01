from fastapi import FastAPI, HTTPException

from academic.service import AcademicService

app = FastAPI(title="Academic Server")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/update")
def update(cookies: str):
    service = AcademicService(cookies=cookies)
    try:
        data = service.update()
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return data
