from datetime import datetime

from pydantic import BaseModel


class MesaBase(BaseModel):
    numero: int
    capacidad: int = 4
    estado: str = "disponible"
    ubicacion: str | None = None
    activo: bool = True


class MesaCreate(MesaBase):
    pass


class MesaUpdate(BaseModel):
    numero: int | None = None
    capacidad: int | None = None
    estado: str | None = None
    ubicacion: str | None = None
    activo: bool | None = None


class MesaOut(MesaBase):
    id: int
    creado_en: datetime
    actualizado_en: datetime | None = None

    model_config = {"from_attributes": True}

