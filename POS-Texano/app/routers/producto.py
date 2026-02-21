from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.producto import (
    create_producto,
    delete_producto,
    get_producto,
    get_productos,
    get_productos_por_categoria,
    update_producto,
)
from app.schemas.producto import ProductoCreate, ProductoOut, ProductoUpdate

router = APIRouter(prefix="/api/productos", tags=["Productos"])


@router.get("/", response_model=list[ProductoOut])
def listar_productos(
    skip: int = 0,
    limit: int = 100,
    categoria_id: int | None = None,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if categoria_id:
        return get_productos_por_categoria(db, categoria_id, skip, limit)
    return get_productos(db, skip, limit)


@router.get("/{producto_id}", response_model=ProductoOut)
def obtener_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_prod = get_producto(db, producto_id)
    if not db_prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db_prod


@router.post("/", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def crear_producto(
    producto_in: ProductoCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    return create_producto(db, producto_in)


@router.put("/{producto_id}", response_model=ProductoOut)
def actualizar_producto(
    producto_id: int,
    producto_in: ProductoUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_prod = update_producto(db, producto_id, producto_in)
    if not db_prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db_prod


@router.delete("/{producto_id}", response_model=ProductoOut)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_prod = delete_producto(db, producto_id)
    if not db_prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db_prod

