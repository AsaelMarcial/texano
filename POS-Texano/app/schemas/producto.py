from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.categoria import CategoriaOut


class ProductoBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    precio: Decimal
    categoria_id: int
    imagen_url: str | None = None
    disponible: bool = True
    tiempo_preparacion: int | None = None
    activo: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    precio: Decimal | None = None
    categoria_id: int | None = None
    imagen_url: str | None = None
    disponible: bool | None = None
    tiempo_preparacion: int | None = None
    activo: bool | None = None


class ProductoOut(ProductoBase):
    id: int
    creado_en: datetime
    actualizado_en: datetime | None = None
    categoria: CategoriaOut | None = None

    model_config = {"from_attributes": True}

