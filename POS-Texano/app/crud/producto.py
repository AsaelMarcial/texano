from sqlalchemy.orm import Session, joinedload

from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate


def get_productos(db: Session, skip: int = 0, limit: int = 100) -> list[Producto]:
    return (
        db.query(Producto)
        .options(joinedload(Producto.categoria))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_producto(db: Session, producto_id: int) -> Producto | None:
    return (
        db.query(Producto)
        .options(joinedload(Producto.categoria))
        .filter(Producto.id == producto_id)
        .first()
    )


def get_productos_por_categoria(
    db: Session, categoria_id: int, skip: int = 0, limit: int = 100
) -> list[Producto]:
    return (
        db.query(Producto)
        .options(joinedload(Producto.categoria))
        .filter(Producto.categoria_id == categoria_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_producto(db: Session, producto_in: ProductoCreate) -> Producto:
    db_prod = Producto(**producto_in.model_dump())
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return get_producto(db, db_prod.id)


def update_producto(
    db: Session, producto_id: int, producto_in: ProductoUpdate
) -> Producto | None:
    db_prod = get_producto(db, producto_id)
    if not db_prod:
        return None
    update_data = producto_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_prod, field, value)
    db.commit()
    db.refresh(db_prod)
    return db_prod


def delete_producto(db: Session, producto_id: int) -> Producto | None:
    db_prod = get_producto(db, producto_id)
    if not db_prod:
        return None
    db.delete(db_prod)
    db.commit()
    return db_prod

