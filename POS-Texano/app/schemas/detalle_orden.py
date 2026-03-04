from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, model_validator


class DetalleOrdenBase(BaseModel):
    producto_id: int
    cantidad: Decimal = Decimal("1")
    notas: str | None = None
    precio_unitario: Decimal | None = None  # Override para productos a granel


class DetalleOrdenCreate(DetalleOrdenBase):
    pass


class DetalleOrdenUpdate(BaseModel):
    cantidad: Decimal | None = None
    notas: str | None = None
    estado: str | None = None


class DetalleOrdenOut(BaseModel):
    id: int
    orden_id: int
    producto_id: int
    cantidad: Decimal
    precio_unitario: Decimal
    subtotal: Decimal
    notas: str | None = None
    estado: str
    producto_nombre: str | None = None
    es_granel: bool = False
    creado_en: datetime
    actualizado_en: datetime | None = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def resolver_producto_nombre(cls, data):
        """Extrae el nombre del producto de la relación ORM."""
        if hasattr(data, "producto") and data.producto:
            data.producto_nombre = data.producto.nombre
            data.es_granel = data.producto.es_granel
        return data

