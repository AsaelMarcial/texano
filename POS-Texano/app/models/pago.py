from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Pago(Base):
    __tablename__ = "pagos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("ordenes.id"), nullable=False
    )
    monto: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    metodo_pago: Mapped[str] = mapped_column(String(20), nullable=False)
    referencia: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cajero_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False
    )
    creado_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relaciones
    orden: Mapped["Orden"] = relationship("Orden", back_populates="pagos")  # noqa: F821
    cajero: Mapped["Usuario"] = relationship(  # noqa: F821
        "Usuario", back_populates="pagos", foreign_keys=[cajero_id]
    )

