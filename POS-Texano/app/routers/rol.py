from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.rol import create_rol, delete_rol, get_rol, get_rol_by_nombre, get_roles, update_rol
from app.schemas.rol import RolCreate, RolOut, RolUpdate

router = APIRouter(prefix="/api/roles", tags=["Roles"])


@router.get("/", response_model=list[RolOut])
def listar_roles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    return get_roles(db, skip, limit)


@router.get("/{rol_id}", response_model=RolOut)
def obtener_rol(
    rol_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_rol = get_rol(db, rol_id)
    if not db_rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return db_rol


@router.post("/", response_model=RolOut, status_code=status.HTTP_201_CREATED)
def crear_rol(
    rol_in: RolCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if get_rol_by_nombre(db, rol_in.nombre):
        raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre")
    return create_rol(db, rol_in)


@router.put("/{rol_id}", response_model=RolOut)
def actualizar_rol(
    rol_id: int,
    rol_in: RolUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_rol = update_rol(db, rol_id, rol_in)
    if not db_rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return db_rol


@router.delete("/{rol_id}", response_model=RolOut)
def eliminar_rol(
    rol_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_rol = delete_rol(db, rol_id)
    if not db_rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return db_rol

