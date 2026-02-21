import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.security import get_current_user

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])

UPLOAD_DIR = "uploads/productos"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/imagen")
async def upload_imagen(
    archivo: UploadFile = File(...),
    _current_user=Depends(get_current_user),
):
    """Subir imagen de producto. Retorna la URL relativa."""
    # Validar extensión
    ext = os.path.splitext(archivo.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Usa: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Leer contenido y validar tamaño
    contenido = await archivo.read()
    if len(contenido) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="El archivo excede 5 MB")

    # Guardar con nombre único
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    nombre_archivo = f"{uuid.uuid4().hex}{ext}"
    ruta = os.path.join(UPLOAD_DIR, nombre_archivo)

    with open(ruta, "wb") as f:
        f.write(contenido)

    url = f"/uploads/productos/{nombre_archivo}"
    return {"url": url, "filename": nombre_archivo}

