from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.rol import Rol
from app.models.usuario import Usuario

settings = get_settings()

ROLES_INICIALES = [
    {"nombre": "administrador", "descripcion": "Acceso total al sistema"},
    {"nombre": "cajero", "descripcion": "Gestiona cobros y cortes de caja"},
    {"nombre": "mesero", "descripcion": "Toma órdenes y atiende mesas"},
    {"nombre": "cocinero", "descripcion": "Visualiza y gestiona pedidos en cocina"},
]


def seed_roles(db: Session) -> None:
    """Inserta roles iniciales si no existen."""
    for rol_data in ROLES_INICIALES:
        existe = db.query(Rol).filter(Rol.nombre == rol_data["nombre"]).first()
        if not existe:
            db.add(Rol(**rol_data))
    db.commit()


def seed_admin(db: Session) -> None:
    """Inserta el usuario administrador por defecto si no existe."""
    admin = db.query(Usuario).filter(Usuario.email == settings.ADMIN_EMAIL).first()
    if admin:
        return

    rol_admin = db.query(Rol).filter(Rol.nombre == "administrador").first()
    if not rol_admin:
        return

    admin = Usuario(
        nombre=settings.ADMIN_NOMBRE,
        apellido=settings.ADMIN_APELLIDO,
        email=settings.ADMIN_EMAIL,
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        rol_id=rol_admin.id,
        activo=True,
    )
    db.add(admin)
    db.commit()


def run_seeds(db: Session) -> None:
    """Ejecuta todos los seeds."""
    seed_roles(db)
    seed_admin(db)

