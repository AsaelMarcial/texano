from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("roles.id"), nullable=False
    )
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    actualizado_en: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    # Relaciones
    rol: Mapped["Rol"] = relationship("Rol", back_populates="usuarios")  # noqa: F821
    ordenes: Mapped[list["Orden"]] = relationship(  # noqa: F821
        "Orden", back_populates="mesero", foreign_keys="Orden.mesero_id"
    )
    pagos: Mapped[list["Pago"]] = relationship(  # noqa: F821
        "Pago", back_populates="cajero", foreign_keys="Pago.cajero_id"
    )
    cortes_caja: Mapped[list["CorteCaja"]] = relationship(  # noqa: F821
        "CorteCaja", back_populates="cajero"
    )

