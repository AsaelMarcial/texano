from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class CorteCajaBase(BaseModel):
    fondo_inicial: Decimal


class CorteCajaCreate(CorteCajaBase):
    pass


class CorteCajaClose(BaseModel):
    total_real: Decimal
    notas: str | None = None


class CorteCajaUpdate(BaseModel):
    notas: str | None = None


class CorteCajaOut(BaseModel):
    id: int
    cajero_id: int
    fecha_inicio: datetime
    fecha_fin: datetime | None = None
    fondo_inicial: Decimal
    total_ventas: Decimal
    total_efectivo: Decimal
    total_tarjeta: Decimal
    total_transferencia: Decimal
    total_esperado: Decimal
    total_real: Decimal | None = None
    diferencia: Decimal | None = None
    estado: str
    notas: str | None = None
    creado_en: datetime

    model_config = {"from_attributes": True}

