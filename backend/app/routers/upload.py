from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from app.config import settings

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("")
async def upload_image(file: UploadFile = File(...)):
    # Validate extension
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPG, PNG, WEBP, AVIF, GIF")

    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": filename,
        "url": f"/uploads/{filename}",
        "success": True
    }
