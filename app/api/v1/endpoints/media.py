from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import aiofiles
import os
from datetime import datetime
import uuid
from app.core.config import settings
from app.api.deps import admin_required

router = APIRouter()

def get_file_extension(filename: str) -> str:
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

def is_allowed_file(filename: str, file_type: str) -> bool:
    extension = get_file_extension(filename)
    return extension in settings.ALLOWED_EXTENSIONS.get(file_type, set())

async def check_file_size(file: UploadFile, file_type: str) -> None:
    max_size = settings.MAX_FILE_SIZE.get(file_type)
    if not max_size:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file_type}")
    
    # Read first chunk to get content length
    chunk = await file.read(max_size + 1)
    file_size = len(chunk)
    
    # Reset file position for later reading
    await file.seek(0)
    
    if file_size > max_size:
        readable_size = f"{max_size / 1_000_000:.1f}MB"
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size for {file_type} is {readable_size}"
        )

@router.post("/upload/{file_type}", dependencies=[Depends(admin_required)])
async def upload_file(
    file_type: str,
    file: UploadFile = File(...),
):
    if file_type not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    if not is_allowed_file(file.filename, file_type):
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed extensions: {settings.ALLOWED_EXTENSIONS[file_type]}"
        )
    
    # Check file size
    await check_file_size(file, file_type)

    # Create upload directory if it doesn't exist
    upload_path = os.path.join(settings.UPLOAD_DIR, file_type)
    os.makedirs(upload_path, exist_ok=True)

    # Generate unique filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    extension = get_file_extension(file.filename)
    new_filename = f"{timestamp}_{unique_id}.{extension}"
    file_path = os.path.join(upload_path, new_filename)

    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
        
        return {
            "url": f"{settings.SERVER_HOST}/uploads/{file_type}/{new_filename}",
            "filename": new_filename,
            "content_type": file.content_type
        }
    except Exception as e:
        # Clean up file if it was created
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files/{file_type}", dependencies=[Depends(admin_required)])
async def list_files(file_type: str):
    if file_type not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    upload_path = os.path.join(settings.UPLOAD_DIR, file_type)
    if not os.path.exists(upload_path):
        return []
    
    files = []
    for filename in os.listdir(upload_path):
        if is_allowed_file(filename, file_type):
            files.append({
                "url": f"{settings.SERVER_HOST}/uploads/{file_type}/{filename}",
                "filename": filename
            })
    
    return files

@router.delete("/{file_type}/{filename}", dependencies=[Depends(admin_required)])
async def delete_file(file_type: str, filename: str):
    if file_type not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    if not is_allowed_file(filename, file_type):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed extensions: {settings.ALLOWED_EXTENSIONS[file_type]}"
        )
    
    file_path = os.path.join(settings.UPLOAD_DIR, file_type, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"status": "success", "message": f"File {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error deleting file: {str(e)}"
        )
