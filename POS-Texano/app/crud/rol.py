from sqlalchemy.orm import Session

from app.models.rol import Rol
from app.schemas.rol import RolCreate, RolUpdate


def get_roles(db: Session, skip: int = 0, limit: int = 100) -> list[Rol]:
    return db.query(Rol).offset(skip).limit(limit).all()


def get_rol(db: Session, rol_id: int) -> Rol | None:
    return db.query(Rol).filter(Rol.id == rol_id).first()


def get_rol_by_nombre(db: Session, nombre: str) -> Rol | None:
    return db.query(Rol).filter(Rol.nombre == nombre).first()


def create_rol(db: Session, rol_in: RolCreate) -> Rol:
    db_rol = Rol(**rol_in.model_dump())
    db.add(db_rol)
    db.commit()
    db.refresh(db_rol)
    return db_rol


def update_rol(db: Session, rol_id: int, rol_in: RolUpdate) -> Rol | None:
    db_rol = get_rol(db, rol_id)
    if not db_rol:
        return None
    update_data = rol_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_rol, field, value)
    db.commit()
    db.refresh(db_rol)
    return db_rol


def delete_rol(db: Session, rol_id: int) -> Rol | None:
    db_rol = get_rol(db, rol_id)
    if not db_rol:
        return None
    db.delete(db_rol)
    db.commit()
    return db_rol

