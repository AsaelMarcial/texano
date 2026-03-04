from decimal import Decimal

from sqlalchemy.orm import Session, joinedload, subqueryload

from app.models.orden import Orden
from app.models.detalle_orden import DetalleOrden
from app.models.producto import Producto
from app.schemas.orden import OrdenCreate, OrdenUpdate


def _generar_numero_orden(db: Session) -> str:
    """Genera un número de orden secuencial: ORD-00001, ORD-00002, etc."""
    ultima = db.query(Orden).order_by(Orden.id.desc()).first()
    siguiente = (ultima.id + 1) if ultima else 1
    return f"ORD-{siguiente:05d}"


def _recalcular_totales(orden: Orden) -> None:
    """Recalcula subtotal, impuesto y total de una orden."""
    subtotal = sum(d.subtotal for d in orden.detalles)
    impuesto = Decimal("0")  # IVA ya incluido en precios
    orden.subtotal = subtotal
    orden.impuesto = impuesto
    orden.total = subtotal  # Total = subtotal (IVA incluido)


def _orden_options():
    """Opciones de carga comunes para incluir detalles con nombre de producto."""
    return [
        joinedload(Orden.detalles).joinedload(DetalleOrden.producto),
    ]


def get_ordenes(db: Session, skip: int = 0, limit: int = 100) -> list[Orden]:
    return (
        db.query(Orden)
        .options(*_orden_options())
        .order_by(Orden.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_orden(db: Session, orden_id: int) -> Orden | None:
    return (
        db.query(Orden)
        .options(*_orden_options())
        .filter(Orden.id == orden_id)
        .first()
    )


def get_ordenes_por_estado(
    db: Session, estado: str, skip: int = 0, limit: int = 100
) -> list[Orden]:
    return (
        db.query(Orden)
        .options(*_orden_options())
        .filter(Orden.estado == estado)
        .order_by(Orden.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_orden(db: Session, orden_in: OrdenCreate, mesero_id: int) -> Orden:
    numero_orden = _generar_numero_orden(db)

    db_orden = Orden(
        numero_orden=numero_orden,
        mesa_id=orden_in.mesa_id,
        mesero_id=mesero_id,
        tipo=orden_in.tipo,
        notas=orden_in.notas,
    )

    # Agregar detalles
    for detalle_in in orden_in.detalles:
        producto = db.query(Producto).filter(
            Producto.id == detalle_in.producto_id
        ).first()
        if not producto:
            continue

        # Productos a granel: usar precio_unitario del request
        if producto.es_granel and detalle_in.precio_unitario is not None:
            precio = detalle_in.precio_unitario
        else:
            precio = producto.precio

        subtotal = precio * detalle_in.cantidad
        db_detalle = DetalleOrden(
            producto_id=detalle_in.producto_id,
            cantidad=detalle_in.cantidad,
            precio_unitario=precio,
            subtotal=subtotal,
            notas=detalle_in.notas,
        )
        db_orden.detalles.append(db_detalle)

    db.add(db_orden)
    db.flush()
    _recalcular_totales(db_orden)
    db.commit()
    db.refresh(db_orden)
    return get_orden(db, db_orden.id)


def update_orden(
    db: Session, orden_id: int, orden_in: OrdenUpdate
) -> Orden | None:
    db_orden = get_orden(db, orden_id)
    if not db_orden:
        return None
    update_data = orden_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_orden, field, value)
    db.commit()
    db.refresh(db_orden)
    return db_orden


def delete_orden(db: Session, orden_id: int) -> Orden | None:
    db_orden = get_orden(db, orden_id)
    if not db_orden:
        return None
    db.delete(db_orden)
    db.commit()
    return db_orden

