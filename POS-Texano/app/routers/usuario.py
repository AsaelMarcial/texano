from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.usuario import (
    create_usuario,
    delete_usuario,
    get_usuario,
    get_usuario_by_email,
    get_usuarios,
    update_usuario,
)
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])


@router.get("/", response_model=list[UsuarioOut])
def listar_usuarios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    return get_usuarios(db, skip, limit)


@router.get("/me", response_model=UsuarioOut)
def obtener_mi_perfil(
    current_user=Depends(get_current_user),
):
    return current_user


@router.get("/{usuario_id}", response_model=UsuarioOut)
def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_usuario = get_usuario(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario


@router.post("/", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    usuario_in: UsuarioCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if get_usuario_by_email(db, usuario_in.email):
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese email")
    return create_usuario(db, usuario_in)


@router.put("/{usuario_id}", response_model=UsuarioOut)
def actualizar_usuario(
    usuario_id: int,
    usuario_in: UsuarioUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_usuario = update_usuario(db, usuario_id, usuario_in)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario


@router.delete("/{usuario_id}", response_model=UsuarioOut)
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_usuario = delete_usuario(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario

