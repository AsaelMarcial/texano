"""granel_corte_websocket

Revision ID: c1a2b3d4e5f6
Revises: b0a13ae6749b
Create Date: 2026-03-03 12:00:00.000000

Agrega:
- productos.es_granel (BOOLEAN DEFAULT FALSE)
- detalles_orden.cantidad cambia de INT a NUMERIC(10,3)
- pagos.corte_caja_id (FK → cortes_caja.id, NULLABLE)
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "c1a2b3d4e5f6"
down_revision = "b0a13ae6749b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Producto: agregar campo es_granel
    op.add_column(
        "productos",
        sa.Column("es_granel", sa.Boolean(), nullable=False, server_default=sa.text("0")),
    )

    # 2. DetalleOrden: cambiar cantidad de INT a NUMERIC(10,3)
    op.alter_column(
        "detalles_orden",
        "cantidad",
        existing_type=sa.Integer(),
        type_=sa.Numeric(10, 3),
        existing_nullable=False,
    )

    # 3. Pago: agregar corte_caja_id FK
    op.add_column(
        "pagos",
        sa.Column("corte_caja_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_pagos_corte_caja_id",
        "pagos",
        "cortes_caja",
        ["corte_caja_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_pagos_corte_caja_id", "pagos", type_="foreignkey")
    op.drop_column("pagos", "corte_caja_id")

    op.alter_column(
        "detalles_orden",
        "cantidad",
        existing_type=sa.Numeric(10, 3),
        type_=sa.Integer(),
        existing_nullable=False,
    )

    op.drop_column("productos", "es_granel")
