from fastapi import HTTPException
import json
import os
from pathlib import Path
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def get_content_path(content_type: str, locale: str) -> Path:
    if content_type not in settings.ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid content type")
    return Path(settings.CONTENT_DIR) / f"{content_type}_{locale}.json"

async def read_content(content_type: str, locale: str = settings.DEFAULT_LOCALE) -> dict:
    file_path = await get_content_path(content_type, locale)
    if not file_path.exists():
        return {}
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading {content_type} content: {str(e)}")
        return {}

async def write_content(content_type: str, content: dict, locale: str = settings.DEFAULT_LOCALE):
    try:
        os.makedirs(settings.CONTENT_DIR, exist_ok=True)
        file_path = await get_content_path(content_type, locale)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(content, f, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error writing {content_type} content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update {content_type}")
