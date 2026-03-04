from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class CorteCaja(Base):
    __tablename__ = "cortes_caja"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cajero_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False
    )
    fecha_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fecha_fin: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    fondo_inicial: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    total_ventas: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    total_efectivo: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    total_tarjeta: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    total_transferencia: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    total_esperado: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    total_real: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    diferencia: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    estado: Mapped[str] = mapped_column(String(20), default="abierto")
    notas: Mapped[str | None] = mapped_column(Text, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relaciones
    cajero: Mapped["Usuario"] = relationship(  # noqa: F821
        "Usuario", back_populates="cortes_caja"
    )
    pagos: Mapped[list["Pago"]] = relationship(  # noqa: F821
        "Pago", back_populates="corte_caja"
    )

