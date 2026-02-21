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


def get_corte_abierto(db: Session, cajero_id: int) -> CorteCaja | None:
    """Busca si el cajero tiene un corte abierto."""
    return (
        db.query(CorteCaja)
        .filter(CorteCaja.cajero_id == cajero_id, CorteCaja.estado == "abierto")
        .first()
    )


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

    # Calcular totales por método de pago desde fecha_inicio
    pagos = (
        db.query(Pago)
        .filter(Pago.cajero_id == db_corte.cajero_id)
        .filter(Pago.creado_en >= db_corte.fecha_inicio)
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
    total_esperado = db_corte.fondo_inicial + total_efectivo

    db_corte.fecha_fin = datetime.now(timezone.utc)
    db_corte.total_ventas = total_ventas
    db_corte.total_efectivo = total_efectivo
    db_corte.total_tarjeta = total_tarjeta
    db_corte.total_transferencia = total_transferencia
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

