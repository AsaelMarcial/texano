from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.detalle_orden import (
    create_detalle,
    delete_detalle,
    get_detalle,
    get_detalles_por_orden,
    update_detalle,
)
from app.schemas.detalle_orden import DetalleOrdenCreate, DetalleOrdenOut, DetalleOrdenUpdate

router = APIRouter(prefix="/api/ordenes/{orden_id}/detalles", tags=["Detalles de Orden"])


@router.get("/", response_model=list[DetalleOrdenOut])
def listar_detalles(
    orden_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    return get_detalles_por_orden(db, orden_id, skip, limit)


@router.get("/{detalle_id}", response_model=DetalleOrdenOut)
def obtener_detalle(
    orden_id: int,
    detalle_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_detalle = get_detalle(db, detalle_id)
    if not db_detalle or db_detalle.orden_id != orden_id:
        raise HTTPException(status_code=404, detail="Detalle no encontrado")
    return db_detalle


@router.post("/", response_model=DetalleOrdenOut, status_code=status.HTTP_201_CREATED)
def crear_detalle(
    orden_id: int,
    detalle_in: DetalleOrdenCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_detalle = create_detalle(db, orden_id, detalle_in)
    if not db_detalle:
        raise HTTPException(status_code=400, detail="Producto no encontrado")
    return db_detalle


@router.put("/{detalle_id}", response_model=DetalleOrdenOut)
def actualizar_detalle(
    orden_id: int,
    detalle_id: int,
    detalle_in: DetalleOrdenUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_detalle = get_detalle(db, detalle_id)
    if not db_detalle or db_detalle.orden_id != orden_id:
        raise HTTPException(status_code=404, detail="Detalle no encontrado")
    updated = update_detalle(db, detalle_id, detalle_in)
    return updated


@router.delete("/{detalle_id}", response_model=DetalleOrdenOut)
def eliminar_detalle(
    orden_id: int,
    detalle_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_detalle = get_detalle(db, detalle_id)
    if not db_detalle or db_detalle.orden_id != orden_id:
        raise HTTPException(status_code=404, detail="Detalle no encontrado")
    deleted = delete_detalle(db, detalle_id)
    return deleted

