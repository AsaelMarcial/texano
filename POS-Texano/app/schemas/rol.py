from datetime import datetime

from pydantic import BaseModel


class RolBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    activo: bool = True


class RolCreate(RolBase):
    pass


class RolUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    activo: bool | None = None


class RolOut(RolBase):
    id: int
    creado_en: datetime
    actualizado_en: datetime | None = None

    model_config = {"from_attributes": True}

