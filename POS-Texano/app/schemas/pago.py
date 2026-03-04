from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class PagoBase(BaseModel):
    orden_id: int
    monto: Decimal
    metodo_pago: str
    referencia: str | None = None


class PagoCreate(PagoBase):
    pass


class PagoUpdate(BaseModel):
    monto: Decimal | None = None
    metodo_pago: str | None = None
    referencia: str | None = None


class PagoOut(BaseModel):
    id: int
    orden_id: int
    monto: Decimal
    metodo_pago: str
    referencia: str | None = None
    cajero_id: int
    corte_caja_id: int | None = None
    creado_en: datetime

    model_config = {"from_attributes": True}

