from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    precio: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    categoria_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categorias.id"), nullable=False
    )
    imagen_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    es_granel: Mapped[bool] = mapped_column(Boolean, default=False)
    disponible: Mapped[bool] = mapped_column(Boolean, default=True)
    tiempo_preparacion: Mapped[int | None] = mapped_column(Integer, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    actualizado_en: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    # Relaciones
    categoria: Mapped["Categoria"] = relationship(  # noqa: F821
        "Categoria", back_populates="productos"
    )
    detalles_orden: Mapped[list["DetalleOrden"]] = relationship(  # noqa: F821
        "DetalleOrden", back_populates="producto"
    )

