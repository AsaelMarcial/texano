from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.detalle_orden import DetalleOrdenCreate, DetalleOrdenOut


class OrdenBase(BaseModel):
    mesa_id: int | None = None
    tipo: str = "en_sitio"
    notas: str | None = None


class OrdenCreate(OrdenBase):
    detalles: list[DetalleOrdenCreate] = []


class OrdenUpdate(BaseModel):
    mesa_id: int | None = None
    estado: str | None = None
    tipo: str | None = None
    notas: str | None = None


class OrdenOut(BaseModel):
    id: int
    numero_orden: str
    mesa_id: int | None = None
    mesero_id: int
    estado: str
    tipo: str
    subtotal: Decimal
    impuesto: Decimal
    total: Decimal
    notas: str | None = None
    creado_en: datetime
    actualizado_en: datetime | None = None
    detalles: list[DetalleOrdenOut] = []

    model_config = {"from_attributes": True}

