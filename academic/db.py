import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path.home() / ".local" / "share" / "academic" / "sigaa.db"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS perfil (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                scraped_at TEXT NOT NULL,
                nome TEXT, matricula TEXT, curso TEXT, nivel TEXT, status TEXT,
                email TEXT, entrada TEXT,
                ip REAL, ti REAL, mge REAL, pmf REAL, ta REAL, qr REAL, mre REAL,
                ch_exigida INTEGER, ch_cursada INTEGER
            );

            CREATE TABLE IF NOT EXISTS materias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT, local TEXT, horario TEXT
            );

            CREATE TABLE IF NOT EXISTS atividades (
                id TEXT PRIMARY KEY,
                tipo TEXT, due TEXT, nome TEXT, materia TEXT,
                first_seen TEXT NOT NULL, last_seen TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS atualizacoes_turma (
                id TEXT PRIMARY KEY,
                materia TEXT, criacao TEXT, descricao TEXT,
                first_seen TEXT NOT NULL
            );
        """)


def save_snapshot(data: dict) -> None:
    now = datetime.now().isoformat()
    with _connect() as conn:
        conn.execute("""
            INSERT INTO perfil (
                id, scraped_at, nome, matricula, curso, nivel, status,
                email, entrada, ip, ti, mge, pmf, ta, qr, mre, ch_exigida, ch_cursada
            ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                scraped_at=excluded.scraped_at, nome=excluded.nome,
                matricula=excluded.matricula, curso=excluded.curso,
                nivel=excluded.nivel, status=excluded.status,
                email=excluded.email, entrada=excluded.entrada,
                ip=excluded.ip, ti=excluded.ti, mge=excluded.mge,
                pmf=excluded.pmf, ta=excluded.ta, qr=excluded.qr,
                mre=excluded.mre, ch_exigida=excluded.ch_exigida,
                ch_cursada=excluded.ch_cursada
        """, (
            now,
            data.get("nome"), data.get("matricula"), data.get("curso"),
            data.get("nivel"), data.get("status"), data.get("email"),
            data.get("entrada"), data.get("ip"), data.get("ti"),
            data.get("mge"), data.get("pmf"), data.get("ta"),
            data.get("qr"), data.get("mre"),
            data.get("ch_exigida"), data.get("ch_cursada"),
        ))

        conn.execute("DELETE FROM materias")
        conn.executemany(
            "INSERT INTO materias (nome, local, horario) VALUES (?, ?, ?)",
            [(m["nome"], m.get("local"), m.get("horario")) for m in data.get("materias", [])],
        )

        for a in data.get("atividades", []):
            conn.execute("""
                INSERT INTO atividades (id, tipo, due, nome, materia, first_seen, last_seen)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET last_seen=excluded.last_seen
            """, (a["id"], a["tipo"], a.get("due"), a["nome"], a["materia"], now, now))

        for u in data.get("atualizacoes_turma", []):
            conn.execute("""
                INSERT OR IGNORE INTO atualizacoes_turma (id, materia, criacao, descricao, first_seen)
                VALUES (?, ?, ?, ?, ?)
            """, (u["id"], u["materia"], u.get("criacao"), u["descricao"], now))
