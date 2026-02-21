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
    get_cortes,
)
from app.schemas.corte_caja import CorteCajaClose, CorteCajaCreate, CorteCajaOut

router = APIRouter(prefix="/api/cortes-caja", tags=["Cortes de Caja"])


@router.get("/", response_model=list[CorteCajaOut])
def listar_cortes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    return get_cortes(db, skip, limit)


@router.get("/abierto", response_model=CorteCajaOut)
def obtener_corte_abierto(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    corte = get_corte_abierto(db, current_user.id)
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


@router.post("/abrir", response_model=CorteCajaOut, status_code=status.HTTP_201_CREATED)
def abrir_corte_caja(
    corte_in: CorteCajaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Verificar que no tenga un corte abierto
    corte_existente = get_corte_abierto(db, current_user.id)
    if corte_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya tienes un corte de caja abierto. Ciérralo antes de abrir otro.",
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

