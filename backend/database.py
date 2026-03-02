from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import urllib.parse

# SQLAlchemy can mis-parse complex Neon URLs (e.g. SNI pooler hostnames with dots).
# We parse the URL into components and pass host/port explicitly via connect_args.
_url = settings.database_url
_parsed = urllib.parse.urlparse(_url)

_pg_host = _parsed.hostname
_pg_port = _parsed.port or 5432
_pg_user = urllib.parse.unquote(_parsed.username or "")
_pg_pass = urllib.parse.unquote(_parsed.password or "")
_pg_db   = _parsed.path.lstrip("/")
_sslmode = urllib.parse.parse_qs(_parsed.query).get("sslmode", ["require"])[0]

_clean_url = (
    f"postgresql+psycopg://{_pg_user}:{_pg_pass}"
    f"@{_pg_host}:{_pg_port}/{_pg_db}"
)

engine = create_engine(
    _clean_url,
    pool_pre_ping=True,
    connect_args={"sslmode": _sslmode},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
