from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.ws_manager import manager
from app.crud.orden import (
    create_orden,
    delete_orden,
    get_orden,
    get_ordenes,
    get_ordenes_por_estado,
    update_orden,
)
from app.schemas.orden import OrdenCreate, OrdenOut, OrdenUpdate

router = APIRouter(prefix="/api/ordenes", tags=["Órdenes"])

# Router separado para WebSocket (sin prefix de /api/ordenes)
ws_router = APIRouter()


@ws_router.websocket("/ws/ordenes")
async def websocket_ordenes(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantener la conexión abierta esperando mensajes (ping/pong)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.get("/", response_model=list[OrdenOut])
def listar_ordenes(
    skip: int = 0,
    limit: int = 100,
    estado: str | None = None,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if estado:
        return get_ordenes_por_estado(db, estado, skip, limit)
    return get_ordenes(db, skip, limit)


@router.get("/{orden_id}", response_model=OrdenOut)
def obtener_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_orden = get_orden(db, orden_id)
    if not db_orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return db_orden


@router.post("/", response_model=OrdenOut, status_code=status.HTTP_201_CREATED)
async def crear_orden(
    orden_in: OrdenCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    nueva_orden = create_orden(db, orden_in, mesero_id=current_user.id)

    # Broadcast a todos los clientes WebSocket conectados
    orden_data = OrdenOut.model_validate(nueva_orden).model_dump(mode="json")
    await manager.broadcast({
        "type": "nueva_orden",
        "orden": orden_data,
    })

    return nueva_orden


@router.put("/{orden_id}", response_model=OrdenOut)
def actualizar_orden(
    orden_id: int,
    orden_in: OrdenUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_orden = update_orden(db, orden_id, orden_in)
    if not db_orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return db_orden


@router.delete("/{orden_id}", response_model=OrdenOut)
def eliminar_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_orden = delete_orden(db, orden_id)
    if not db_orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return db_orden

