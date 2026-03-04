from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.corte_caja import CorteCaja
from app.models.pago import Pago
from app.schemas.corte_caja import CorteCajaCreate, CorteCajaClose


def get_cortes(db: Session, skip: int = 0, limit: int = 100) -> list[CorteCaja]:
    return (
        db.query(CorteCaja)
        .order_by(CorteCaja.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_corte(db: Session, corte_id: int) -> CorteCaja | None:
    return db.query(CorteCaja).filter(CorteCaja.id == corte_id).first()


def get_corte_abierto_global(db: Session) -> CorteCaja | None:
    """Busca si hay un corte abierto (global, sin importar cajero)."""
    return (
        db.query(CorteCaja)
        .filter(CorteCaja.estado == "abierto")
        .first()
    )


def get_corte_abierto(db: Session, cajero_id: int) -> CorteCaja | None:
    """Busca si el cajero tiene un corte abierto (legacy, usado en router)."""
    return get_corte_abierto_global(db)


def _calcular_totales_corte(db: Session, corte_id: int) -> dict:
    """Calcula los totales de ventas de un corte a partir de los pagos vinculados."""
    pagos = (
        db.query(Pago)
        .filter(Pago.corte_caja_id == corte_id)
        .all()
    )

    total_efectivo = sum(
        p.monto for p in pagos if p.metodo_pago == "efectivo"
    ) or Decimal("0")
    total_tarjeta = sum(
        p.monto for p in pagos if p.metodo_pago == "tarjeta"
    ) or Decimal("0")
    total_transferencia = sum(
        p.monto for p in pagos if p.metodo_pago == "transferencia"
    ) or Decimal("0")

    total_ventas = total_efectivo + total_tarjeta + total_transferencia

    return {
        "total_efectivo": total_efectivo,
        "total_tarjeta": total_tarjeta,
        "total_transferencia": total_transferencia,
        "total_ventas": total_ventas,
        "num_pagos": len(pagos),
    }


def get_ventas_actuales(db: Session) -> dict:
    """Devuelve el resumen de ventas en vivo del corte abierto actual."""
    corte = get_corte_abierto_global(db)
    if not corte:
        return {
            "corte_id": None,
            "corte_abierto": False,
            "fondo_inicial": Decimal("0"),
            "total_efectivo": Decimal("0"),
            "total_tarjeta": Decimal("0"),
            "total_transferencia": Decimal("0"),
            "total_ventas": Decimal("0"),
            "total_esperado": Decimal("0"),
            "num_pagos": 0,
        }

    totales = _calcular_totales_corte(db, corte.id)
    return {
        "corte_id": corte.id,
        "corte_abierto": True,
        "fondo_inicial": corte.fondo_inicial,
        **totales,
        "total_esperado": corte.fondo_inicial + totales["total_efectivo"],
    }


def abrir_corte(db: Session, corte_in: CorteCajaCreate, cajero_id: int) -> CorteCaja:
    db_corte = CorteCaja(
        cajero_id=cajero_id,
        fecha_inicio=datetime.now(timezone.utc),
        fondo_inicial=corte_in.fondo_inicial,
    )
    db.add(db_corte)
    db.commit()
    db.refresh(db_corte)
    return db_corte


def cerrar_corte(
    db: Session, corte_id: int, corte_close: CorteCajaClose
) -> CorteCaja | None:
    db_corte = get_corte(db, corte_id)
    if not db_corte or db_corte.estado != "abierto":
        return None

    # Calcular totales desde los pagos vinculados a este corte
    totales = _calcular_totales_corte(db, corte_id)

    total_esperado = db_corte.fondo_inicial + totales["total_efectivo"]

    db_corte.fecha_fin = datetime.now(timezone.utc)
    db_corte.total_ventas = totales["total_ventas"]
    db_corte.total_efectivo = totales["total_efectivo"]
    db_corte.total_tarjeta = totales["total_tarjeta"]
    db_corte.total_transferencia = totales["total_transferencia"]
    db_corte.total_esperado = total_esperado
    db_corte.total_real = corte_close.total_real
    db_corte.diferencia = corte_close.total_real - total_esperado
    db_corte.notas = corte_close.notas
    db_corte.estado = "cerrado"

    db.commit()
    db.refresh(db_corte)
    return db_corte


def delete_corte(db: Session, corte_id: int) -> CorteCaja | None:
    db_corte = get_corte(db, corte_id)
    if not db_corte:
        return None
    db.delete(db_corte)
    db.commit()
    return db_corte

