from fastapi import APIRouter, Depends, Body, Path, HTTPException
from app.api.deps import admin_required
from app.services import content_service, openai_service
import logging
from typing import Optional
from app.core.config import settings
from app.schemas.content import HomeContent
import aiohttp
import os
from uuid import uuid4

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/privacy-policy")
async def get_privacy_policy(locale: Optional[str] = settings.DEFAULT_LOCALE):
    """Get privacy policy content for specified locale"""
    return await content_service.read_content("privacy_policy", locale)

@router.get("/terms")
async def get_terms(locale: Optional[str] = settings.DEFAULT_LOCALE):
    """Get terms of service content for specified locale"""
    return await content_service.read_content("terms", locale)

@router.put("/privacy-policy", dependencies=[Depends(admin_required)])
async def update_privacy_policy(
    content: str = Body(..., embed=True),
    locale: Optional[str] = Body(settings.DEFAULT_LOCALE)
):
    """Update privacy policy content for specified locale"""
    await content_service.write_content("privacy_policy", {"content": content}, locale)
    return {"status": "success"}

@router.put("/terms", dependencies=[Depends(admin_required)])
async def update_terms(
    content: str = Body(..., embed=True),
    locale: Optional[str] = Body(settings.DEFAULT_LOCALE)
):
    """Update terms of service content for specified locale"""
    await content_service.write_content("terms", {"content": content}, locale)
    return {"status": "success"}

@router.get("/home/{locale}")
async def get_home_content(
    locale: str = Path(..., description="Language locale code")
):
    """Get home page content for specified locale"""
    content = await content_service.read_content("home", locale)
    logger.info(f"Home content for locale {locale}: {content}")
    return content

@router.put("/home/{locale}", dependencies=[Depends(admin_required)])
async def update_home_content(
    locale: str = Path(..., description="Language locale code"),
    body: dict = Body(...)
):
    """Update home page content for specified locale"""
    content = HomeContent(**body.get("content", {}))
    logger.info(f"Updating home content for locale: {locale}")
    logger.info(f"Content: {content.model_dump()}")
    await content_service.write_content("home", {"content": content.model_dump()}, locale)
    return {"status": "success"}

@router.post("/translate/{content_type}/{source_locale}/{target_locale}", dependencies=[Depends(admin_required)])
async def translate_content(
    content_type: str,
    source_locale: str,
    target_locale: str,
    force: bool = Body(False)
):
    """Translate content from source locale to target locale"""
    # Check if target content already exists
    existing_content = await content_service.read_content(content_type, target_locale)
    if existing_content and not force:
        raise HTTPException(
            status_code=400,
            detail="Content already exists in target locale. Use force=true to override."
        )
    
    # Read source content
    source_content = await content_service.read_content(content_type, source_locale)
    if not source_content:
        raise HTTPException(status_code=404, detail="Source content not found")
    
    # Translate content
    translated_content = await openai_service.translate_content(source_content, target_locale)
    
    # Save translated content
    await content_service.write_content(content_type, translated_content, target_locale)
    return {"status": "success", "translated_content": translated_content}

@router.post("/generate-image", dependencies=[Depends(admin_required)])
async def generate_image(
    prompt: str = Body(...),
    save_to_media: bool = Body(True)
):
    """Generate an image from a prompt using DALL-E"""
    # Generate image URL using DALL-E
    image_url = await openai_service.generate_image(prompt)
    
    if not save_to_media:
        return {"image_url": image_url}
    
    # Download and save the image
    async with aiohttp.ClientSession() as session:
        async with session.get(image_url) as response:
            if response.status != 200:
                raise HTTPException(status_code=500, detail="Failed to download generated image")
            
            # Create unique filename
            file_extension = "png"
            filename = f"generated_{uuid4()}.{file_extension}"
            filepath = os.path.join(settings.UPLOAD_DIR, "images", filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            # Save the image
            with open(filepath, "wb") as f:
                f.write(await response.read())
            
            # Return both the original URL and the saved path
            return {
                "original_url": image_url,
                "saved_path": f"/uploads/images/{filename}",
                "url": f"{settings.SERVER_HOST}/uploads/images/{filename}"
            }

@router.post("/generate-markdown", dependencies=[Depends(admin_required)])
async def generate_markdown(
    prompt: str = Body(...),
    locale: str = Body(settings.DEFAULT_LOCALE)
):
    """Generate markdown content from a prompt using OpenAI"""
    try:
        generated_content = await openai_service.generate_markdown_content(prompt, locale)
        return {
            "status": "success",
            "content": generated_content
        }
    except Exception as e:
        logger.error(f"Failed to generate markdown content: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate markdown content"
        )
