from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.rol import RolOut


class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: str | None = None
    rol_id: int
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    rol_id: int | None = None
    activo: bool | None = None
    password: str | None = None


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: EmailStr
    telefono: str | None = None
    rol_id: int
    activo: bool
    creado_en: datetime
    actualizado_en: datetime | None = None
    rol: RolOut | None = None

    model_config = {"from_attributes": True}

