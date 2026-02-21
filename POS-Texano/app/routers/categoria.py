from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.categoria import (
    create_categoria,
    delete_categoria,
    get_categoria,
    get_categoria_by_nombre,
    get_categorias,
    update_categoria,
)
from app.schemas.categoria import CategoriaCreate, CategoriaOut, CategoriaUpdate

router = APIRouter(prefix="/api/categorias", tags=["Categorías"])


@router.get("/", response_model=list[CategoriaOut])
def listar_categorias(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    return get_categorias(db, skip, limit)


@router.get("/{categoria_id}", response_model=CategoriaOut)
def obtener_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_cat = get_categoria(db, categoria_id)
    if not db_cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return db_cat


@router.post("/", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    categoria_in: CategoriaCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if get_categoria_by_nombre(db, categoria_in.nombre):
        raise HTTPException(
            status_code=400, detail="Ya existe una categoría con ese nombre"
        )
    return create_categoria(db, categoria_in)


@router.put("/{categoria_id}", response_model=CategoriaOut)
def actualizar_categoria(
    categoria_id: int,
    categoria_in: CategoriaUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_cat = update_categoria(db, categoria_id, categoria_in)
    if not db_cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return db_cat


@router.delete("/{categoria_id}", response_model=CategoriaOut)
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_cat = delete_categoria(db, categoria_id)
    if not db_cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return db_cat

