from sqlalchemy.orm import Session

from app.models.mesa import Mesa
from app.schemas.mesa import MesaCreate, MesaUpdate


def get_mesas(db: Session, skip: int = 0, limit: int = 100) -> list[Mesa]:
    return db.query(Mesa).offset(skip).limit(limit).all()


def get_mesa(db: Session, mesa_id: int) -> Mesa | None:
    return db.query(Mesa).filter(Mesa.id == mesa_id).first()


def get_mesa_by_numero(db: Session, numero: int) -> Mesa | None:
    return db.query(Mesa).filter(Mesa.numero == numero).first()


def create_mesa(db: Session, mesa_in: MesaCreate) -> Mesa:
    db_mesa = Mesa(**mesa_in.model_dump())
    db.add(db_mesa)
    db.commit()
    db.refresh(db_mesa)
    return db_mesa


def update_mesa(db: Session, mesa_id: int, mesa_in: MesaUpdate) -> Mesa | None:
    db_mesa = get_mesa(db, mesa_id)
    if not db_mesa:
        return None
    update_data = mesa_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_mesa, field, value)
    db.commit()
    db.refresh(db_mesa)
    return db_mesa


def delete_mesa(db: Session, mesa_id: int) -> Mesa | None:
    db_mesa = get_mesa(db, mesa_id)
    if not db_mesa:
        return None
    db.delete(db_mesa)
    db.commit()
    return db_mesa

