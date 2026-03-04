from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.corte_caja import (
    abrir_corte,
    cerrar_corte,
    delete_corte,
    get_corte,
    get_corte_abierto,
    get_corte_abierto_global,
    get_cortes,
    get_ventas_actuales,
)
from app.crud.pago import get_pagos_por_corte
from app.schemas.corte_caja import CorteCajaClose, CorteCajaCreate, CorteCajaOut, VentasActualesOut
from app.schemas.pago import PagoOut

router = APIRouter(prefix="/api/cortes-caja", tags=["Cortes de Caja"])


@router.get("/", response_model=list[CorteCajaOut])
def listar_cortes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    return get_cortes(db, skip, limit)


@router.get("/ventas-actuales", response_model=VentasActualesOut)
def obtener_ventas_actuales(
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """Devuelve el resumen de ventas en vivo del corte abierto actual."""
    return get_ventas_actuales(db)


@router.get("/abierto", response_model=CorteCajaOut)
def obtener_corte_abierto(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    corte = get_corte_abierto_global(db)
    if not corte:
        raise HTTPException(status_code=404, detail="No hay corte de caja abierto")
    return corte


@router.get("/{corte_id}", response_model=CorteCajaOut)
def obtener_corte(
    corte_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_corte = get_corte(db, corte_id)
    if not db_corte:
        raise HTTPException(status_code=404, detail="Corte de caja no encontrado")
    return db_corte


@router.get("/{corte_id}/pagos", response_model=list[PagoOut])
def obtener_pagos_corte(
    corte_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """Devuelve todos los pagos vinculados a un corte de caja."""
    db_corte = get_corte(db, corte_id)
    if not db_corte:
        raise HTTPException(status_code=404, detail="Corte de caja no encontrado")
    return get_pagos_por_corte(db, corte_id)


@router.post("/abrir", response_model=CorteCajaOut, status_code=status.HTTP_201_CREATED)
def abrir_corte_caja(
    corte_in: CorteCajaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Verificar que no haya un corte abierto (global)
    corte_existente = get_corte_abierto_global(db)
    if corte_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya hay un corte de caja abierto. Ciérralo antes de abrir otro.",
        )
    return abrir_corte(db, corte_in, cajero_id=current_user.id)


@router.post("/{corte_id}/cerrar", response_model=CorteCajaOut)
def cerrar_corte_caja(
    corte_id: int,
    corte_close: CorteCajaClose,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_corte = cerrar_corte(db, corte_id, corte_close)
    if not db_corte:
        raise HTTPException(
            status_code=400,
            detail="Corte de caja no encontrado o ya está cerrado",
        )
    return db_corte


@router.delete("/{corte_id}", response_model=CorteCajaOut)
def eliminar_corte(
    corte_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_corte = delete_corte(db, corte_id)
    if not db_corte:
        raise HTTPException(status_code=404, detail="Corte de caja no encontrado")
    return db_corte

