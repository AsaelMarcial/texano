from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.pago import (
    create_pago,
    delete_pago,
    get_pago,
    get_pagos,
    get_pagos_por_orden,
    update_pago,
)
from app.schemas.pago import PagoCreate, PagoOut, PagoUpdate

router = APIRouter(prefix="/api/pagos", tags=["Pagos"])


@router.get("/", response_model=list[PagoOut])
def listar_pagos(
    skip: int = 0,
    limit: int = 100,
    orden_id: int | None = None,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if orden_id:
        return get_pagos_por_orden(db, orden_id)
    return get_pagos(db, skip, limit)


@router.get("/{pago_id}", response_model=PagoOut)
def obtener_pago(
    pago_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_pago = get_pago(db, pago_id)
    if not db_pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return db_pago


@router.post("/", response_model=PagoOut, status_code=status.HTTP_201_CREATED)
def crear_pago(
    pago_in: PagoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_pago(db, pago_in, cajero_id=current_user.id)


@router.put("/{pago_id}", response_model=PagoOut)
def actualizar_pago(
    pago_id: int,
    pago_in: PagoUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_pago = update_pago(db, pago_id, pago_in)
    if not db_pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return db_pago


@router.delete("/{pago_id}", response_model=PagoOut)
def eliminar_pago(
    pago_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_pago = delete_pago(db, pago_id)
    if not db_pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return db_pago

