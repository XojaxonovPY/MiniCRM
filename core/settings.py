from os import getenv

from dotenv import load_dotenv

from core.env_path import Env_path

load_dotenv(Env_path)


class Settings:
    DB_URL = getenv('DB_URL')
    SECRET_KEY = getenv('SECRET_KEY')
    ADMIN_PANEL_SECRET = getenv('ADMIN_PANEL_SECRET')
