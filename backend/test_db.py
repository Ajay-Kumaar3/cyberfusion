import sys
sys.path.append('.')
from config import settings
from sqlalchemy import create_engine
import urllib.parse

_url = settings.database_url
print(f"Testing connection to: {_url[:20]}...")
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
    connect_args={"sslmode": _sslmode},
)

try:
    with engine.connect() as conn:
        print("Successfully connected to the database!")
except Exception as e:
    print(f"Connection failed: {e}")
