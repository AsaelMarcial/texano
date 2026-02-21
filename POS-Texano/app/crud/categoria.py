from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate


def get_categorias(db: Session, skip: int = 0, limit: int = 100) -> list[Categoria]:
    return db.query(Categoria).order_by(Categoria.orden).offset(skip).limit(limit).all()


def get_categoria(db: Session, categoria_id: int) -> Categoria | None:
    return db.query(Categoria).filter(Categoria.id == categoria_id).first()


def get_categoria_by_nombre(db: Session, nombre: str) -> Categoria | None:
    return db.query(Categoria).filter(Categoria.nombre == nombre).first()


def create_categoria(db: Session, categoria_in: CategoriaCreate) -> Categoria:
    db_cat = Categoria(**categoria_in.model_dump())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat


def update_categoria(
    db: Session, categoria_id: int, categoria_in: CategoriaUpdate
) -> Categoria | None:
    db_cat = get_categoria(db, categoria_id)
    if not db_cat:
        return None
    update_data = categoria_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_cat, field, value)
    db.commit()
    db.refresh(db_cat)
    return db_cat


def delete_categoria(db: Session, categoria_id: int) -> Categoria | None:
    db_cat = get_categoria(db, categoria_id)
    if not db_cat:
        return None
    db.delete(db_cat)
    db.commit()
    return db_cat

