import threading
from datetime import datetime

_lock = threading.Lock()

# Estrutura: { "nome_do_spider": {"data": [...], "updated_at": datetime} }
_store: dict = {}


def set_data(key: str, data: list, error: str | None = None) -> None:
    with _lock:
        _store[key] = {"data": data, "updated_at": datetime.now().isoformat(), "error": error}


def get_data(key: str) -> dict | None:
    with _lock:
        return _store.get(key)


def list_keys() -> list[str]:
    with _lock:
        return list(_store.keys())
