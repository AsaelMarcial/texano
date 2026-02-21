from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.mesa import (
    create_mesa,
    delete_mesa,
    get_mesa,
    get_mesa_by_numero,
    get_mesas,
    update_mesa,
)
from app.schemas.mesa import MesaCreate, MesaOut, MesaUpdate

router = APIRouter(prefix="/api/mesas", tags=["Mesas"])


@router.get("/", response_model=list[MesaOut])
def listar_mesas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    return get_mesas(db, skip, limit)


@router.get("/{mesa_id}", response_model=MesaOut)
def obtener_mesa(
    mesa_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_mesa = get_mesa(db, mesa_id)
    if not db_mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return db_mesa


@router.post("/", response_model=MesaOut, status_code=status.HTTP_201_CREATED)
def crear_mesa(
    mesa_in: MesaCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if get_mesa_by_numero(db, mesa_in.numero):
        raise HTTPException(status_code=400, detail="Ya existe una mesa con ese número")
    return create_mesa(db, mesa_in)


@router.put("/{mesa_id}", response_model=MesaOut)
def actualizar_mesa(
    mesa_id: int,
    mesa_in: MesaUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_mesa = update_mesa(db, mesa_id, mesa_in)
    if not db_mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return db_mesa


@router.delete("/{mesa_id}", response_model=MesaOut)
def eliminar_mesa(
    mesa_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_mesa = delete_mesa(db, mesa_id)
    if not db_mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return db_mesa

