from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.pago import Pago
from app.models.orden import Orden
from app.models.corte_caja import CorteCaja
from app.schemas.pago import PagoCreate, PagoUpdate


def get_pagos(db: Session, skip: int = 0, limit: int = 100) -> list[Pago]:
    return db.query(Pago).order_by(Pago.id.desc()).offset(skip).limit(limit).all()


def get_pago(db: Session, pago_id: int) -> Pago | None:
    return db.query(Pago).filter(Pago.id == pago_id).first()


def get_pagos_por_orden(db: Session, orden_id: int) -> list[Pago]:
    return db.query(Pago).filter(Pago.orden_id == orden_id).all()


def get_pagos_por_corte(db: Session, corte_id: int) -> list[Pago]:
    """Obtiene todos los pagos vinculados a un corte de caja."""
    return (
        db.query(Pago)
        .filter(Pago.corte_caja_id == corte_id)
        .order_by(Pago.id.desc())
        .all()
    )


def create_pago(db: Session, pago_in: PagoCreate, cajero_id: int) -> Pago:
    # Buscar corte de caja abierto (global, no por cajero)
    corte_abierto = (
        db.query(CorteCaja)
        .filter(CorteCaja.estado == "abierto")
        .first()
    )
    if not corte_abierto:
        raise HTTPException(
            status_code=400,
            detail="Debe abrir un corte de caja antes de registrar pagos.",
        )

    db_pago = Pago(
        orden_id=pago_in.orden_id,
        monto=pago_in.monto,
        metodo_pago=pago_in.metodo_pago,
        referencia=pago_in.referencia,
        cajero_id=cajero_id,
        corte_caja_id=corte_abierto.id,
    )
    db.add(db_pago)

    # Marcar la orden como pagada automáticamente
    db_orden = db.query(Orden).filter(Orden.id == pago_in.orden_id).first()
    if db_orden:
        db_orden.estado = "pagada"

    db.commit()
    db.refresh(db_pago)
    return db_pago


def update_pago(db: Session, pago_id: int, pago_in: PagoUpdate) -> Pago | None:
    db_pago = get_pago(db, pago_id)
    if not db_pago:
        return None
    update_data = pago_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pago, field, value)
    db.commit()
    db.refresh(db_pago)
    return db_pago


def delete_pago(db: Session, pago_id: int) -> Pago | None:
    db_pago = get_pago(db, pago_id)
    if not db_pago:
        return None
    db.delete(db_pago)
    db.commit()
    return db_pago

