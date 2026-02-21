from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Mesa(Base):
    __tablename__ = "mesas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    numero: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    capacidad: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    estado: Mapped[str] = mapped_column(String(20), default="disponible")
    ubicacion: Mapped[str | None] = mapped_column(String(50), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    actualizado_en: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    # Relaciones
    ordenes: Mapped[list["Orden"]] = relationship(  # noqa: F821
        "Orden", back_populates="mesa"
    )

