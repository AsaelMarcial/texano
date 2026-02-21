from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
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


class Orden(Base):
    __tablename__ = "ordenes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    numero_orden: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False
    )
    mesa_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("mesas.id"), nullable=True
    )
    mesero_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False
    )
    estado: Mapped[str] = mapped_column(String(20), default="abierta")
    tipo: Mapped[str] = mapped_column(String(20), default="en_sitio")
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    impuesto: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    notas: Mapped[str | None] = mapped_column(Text, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    actualizado_en: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    # Relaciones
    mesa: Mapped["Mesa | None"] = relationship("Mesa", back_populates="ordenes")  # noqa: F821
    mesero: Mapped["Usuario"] = relationship(  # noqa: F821
        "Usuario", back_populates="ordenes", foreign_keys=[mesero_id]
    )
    detalles: Mapped[list["DetalleOrden"]] = relationship(  # noqa: F821
        "DetalleOrden", back_populates="orden", cascade="all, delete-orphan"
    )
    pagos: Mapped[list["Pago"]] = relationship(  # noqa: F821
        "Pago", back_populates="orden", cascade="all, delete-orphan"
    )

