from dataclasses import dataclass

@dataclass
class AppConfig:
    db_path: str = "data/legacy.db"
    host: str = "0.0.0.0"
    port: int = 5000
    debug: bool = True
    iva_rate: float = 0.16
    default_currency: str = "MXN"
    usd_mxn_rate: float = 17.5

# TODO: refactor app.py to use AppConfig instead of globals
