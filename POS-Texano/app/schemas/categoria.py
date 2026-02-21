from datetime import datetime

from pydantic import BaseModel


class CategoriaBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    imagen_url: str | None = None
    orden: int = 0
    activo: bool = True


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    imagen_url: str | None = None
    orden: int | None = None
    activo: bool | None = None


class CategoriaOut(CategoriaBase):
    id: int
    creado_en: datetime
    actualizado_en: datetime | None = None

    model_config = {"from_attributes": True}

