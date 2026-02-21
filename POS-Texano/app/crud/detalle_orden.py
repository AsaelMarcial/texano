from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.detalle_orden import DetalleOrden
from app.models.orden import Orden
from app.models.producto import Producto
from app.schemas.detalle_orden import DetalleOrdenCreate, DetalleOrdenUpdate


def _recalcular_totales_orden(orden: Orden) -> None:
    """Recalcula subtotal, impuesto y total de la orden padre."""
    subtotal = sum(d.subtotal for d in orden.detalles)
    impuesto = subtotal * Decimal("0.16")
    orden.subtotal = subtotal
    orden.impuesto = impuesto
    orden.total = subtotal + impuesto


def get_detalles_por_orden(
    db: Session, orden_id: int, skip: int = 0, limit: int = 100
) -> list[DetalleOrden]:
    return (
        db.query(DetalleOrden)
        .filter(DetalleOrden.orden_id == orden_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_detalle(db: Session, detalle_id: int) -> DetalleOrden | None:
    return db.query(DetalleOrden).filter(DetalleOrden.id == detalle_id).first()


def create_detalle(
    db: Session, orden_id: int, detalle_in: DetalleOrdenCreate
) -> DetalleOrden | None:
    producto = db.query(Producto).filter(
        Producto.id == detalle_in.producto_id
    ).first()
    if not producto:
        return None

    subtotal = producto.precio * detalle_in.cantidad
    db_detalle = DetalleOrden(
        orden_id=orden_id,
        producto_id=detalle_in.producto_id,
        cantidad=detalle_in.cantidad,
        precio_unitario=producto.precio,
        subtotal=subtotal,
        notas=detalle_in.notas,
    )
    db.add(db_detalle)
    db.flush()

    # Recalcular totales de la orden
    orden = db.query(Orden).filter(Orden.id == orden_id).first()
    if orden:
        _recalcular_totales_orden(orden)

    db.commit()
    db.refresh(db_detalle)
    return db_detalle


def update_detalle(
    db: Session, detalle_id: int, detalle_in: DetalleOrdenUpdate
) -> DetalleOrden | None:
    db_detalle = get_detalle(db, detalle_id)
    if not db_detalle:
        return None

    update_data = detalle_in.model_dump(exclude_unset=True)

    if "cantidad" in update_data:
        db_detalle.cantidad = update_data["cantidad"]
        db_detalle.subtotal = db_detalle.precio_unitario * db_detalle.cantidad

    if "notas" in update_data:
        db_detalle.notas = update_data["notas"]

    if "estado" in update_data:
        db_detalle.estado = update_data["estado"]

    db.flush()

    # Recalcular totales de la orden
    orden = db.query(Orden).filter(Orden.id == db_detalle.orden_id).first()
    if orden:
        _recalcular_totales_orden(orden)

    db.commit()
    db.refresh(db_detalle)
    return db_detalle


def delete_detalle(db: Session, detalle_id: int) -> DetalleOrden | None:
    db_detalle = get_detalle(db, detalle_id)
    if not db_detalle:
        return None

    orden_id = db_detalle.orden_id
    db.delete(db_detalle)
    db.flush()

    # Recalcular totales de la orden
    orden = db.query(Orden).filter(Orden.id == orden_id).first()
    if orden:
        _recalcular_totales_orden(orden)

    db.commit()
    return db_detalle

