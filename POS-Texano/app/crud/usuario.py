from sqlalchemy.orm import Session, joinedload

from app.core.security import hash_password
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


def get_usuarios(db: Session, skip: int = 0, limit: int = 100) -> list[Usuario]:
    return (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_usuario(db: Session, usuario_id: int) -> Usuario | None:
    return (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .filter(Usuario.id == usuario_id)
        .first()
    )


def get_usuario_by_email(db: Session, email: str) -> Usuario | None:
    return (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .filter(Usuario.email == email)
        .first()
    )


def create_usuario(db: Session, usuario_in: UsuarioCreate) -> Usuario:
    data = usuario_in.model_dump(exclude={"password"})
    data["password_hash"] = hash_password(usuario_in.password)
    db_usuario = Usuario(**data)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return get_usuario(db, db_usuario.id)


def update_usuario(
    db: Session, usuario_id: int, usuario_in: UsuarioUpdate
) -> Usuario | None:
    db_usuario = get_usuario(db, usuario_id)
    if not db_usuario:
        return None
    update_data = usuario_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        pwd = update_data.pop("password")
        if pwd:
            update_data["password_hash"] = hash_password(pwd)
    for field, value in update_data.items():
        setattr(db_usuario, field, value)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def delete_usuario(db: Session, usuario_id: int) -> Usuario | None:
    db_usuario = get_usuario(db, usuario_id)
    if not db_usuario:
        return None
    db.delete(db_usuario)
    db.commit()
    return db_usuario

