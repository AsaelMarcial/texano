# Importar todos los modelos para que Alembic los detecte
from app.models.base import Base  # noqa: F401
from app.models.rol import Rol  # noqa: F401
from app.models.usuario import Usuario  # noqa: F401
from app.models.mesa import Mesa  # noqa: F401
from app.models.categoria import Categoria  # noqa: F401
from app.models.producto import Producto  # noqa: F401
from app.models.orden import Orden  # noqa: F401
from app.models.detalle_orden import DetalleOrden  # noqa: F401
from app.models.pago import Pago  # noqa: F401
from app.models.corte_caja import CorteCaja  # noqa: F401

