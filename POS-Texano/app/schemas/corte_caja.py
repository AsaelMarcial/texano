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


class VentasActualesOut(BaseModel):
    """Resumen de ventas en vivo del corte abierto."""
    corte_id: int | None = None
    corte_abierto: bool = False
    fondo_inicial: Decimal = Decimal("0")
    total_efectivo: Decimal = Decimal("0")
    total_tarjeta: Decimal = Decimal("0")
    total_transferencia: Decimal = Decimal("0")
    total_ventas: Decimal = Decimal("0")
    total_esperado: Decimal = Decimal("0")
    num_pagos: int = 0

