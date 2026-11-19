import psycopg2
from psycopg2.extras import RealDictCursor

class Database:
    def __init__(self):
        self.host = "127.0.0.1"
        self.database = "cineminuto_db"
        self.user = "postgres"
        self.password = "postgres"
        self.port = "5432"

    def conectar(self):
        return psycopg2.connect(
            host=self.host,
            database=self.database,
            user=self.user,
            password=self.password,
            port=self.port,
            cursor_factory=RealDictCursor
        )