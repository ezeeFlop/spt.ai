from openai import AsyncOpenAI
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def translate_content(content: dict, target_locale: str) -> dict:
    try:
        # Prepare the content for translation
        content_str = str(content)
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": f"Translate the following content to {target_locale}. Maintain the JSON structure and only translate text values."},
                {"role": "user", "content": content_str}
            ]
        )
        
        # Parse the response back to dict
        translated_content = eval(response.choices[0].message.content)
        return translated_content
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise

async def generate_image(prompt: str) -> str:
    try:
        response = await client.images.generate(
            model=settings.OPENAI_IMAGE_MODEL,
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        return response.data[0].url
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise

async def generate_markdown_content(prompt: str, locale: str) -> str:
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": f"Generate markdown content in {locale} language. The content should be well-formatted and ready to use."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Content generation error: {str(e)}")
        raise
