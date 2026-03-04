import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import SessionLocal
from app.core.seed import run_seeds
from app.routers import (
    auth,
    rol,
    usuario,
    mesa,
    categoria,
    producto,
    orden,
    detalle_orden,
    pago,
    corte_caja,
    upload,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Seed de datos iniciales al arrancar la aplicación."""
    db = SessionLocal()
    try:
        run_seeds(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="POS-Texano API",
    description="Sistema Punto de Venta para Restaurante El Texano",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Archivos estáticos (uploads)
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Registrar routers
app.include_router(auth.router)
app.include_router(rol.router)
app.include_router(usuario.router)
app.include_router(mesa.router)
app.include_router(categoria.router)
app.include_router(producto.router)
app.include_router(orden.router)
app.include_router(orden.ws_router)  # WebSocket para órdenes en tiempo real
app.include_router(detalle_orden.router)
app.include_router(pago.router)
app.include_router(corte_caja.router)
app.include_router(upload.router)


@app.get("/", tags=["Root"])
def root():
    return {"message": "POS-Texano API funcionando", "docs": "/docs"}



