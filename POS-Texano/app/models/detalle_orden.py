from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class DetalleOrden(Base):
    __tablename__ = "detalles_orden"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("ordenes.id"), nullable=False
    )
    producto_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("productos.id"), nullable=False
    )
    cantidad: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False, default=1)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    notas: Mapped[str | None] = mapped_column(String(255), nullable=True)
    estado: Mapped[str] = mapped_column(String(20), default="pendiente")
    creado_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    actualizado_en: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    # Relaciones
    orden: Mapped["Orden"] = relationship(  # noqa: F821
        "Orden", back_populates="detalles"
    )
    producto: Mapped["Producto"] = relationship(  # noqa: F821
        "Producto", back_populates="detalles_orden"
    )

