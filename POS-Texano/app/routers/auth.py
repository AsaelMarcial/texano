from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.crud.usuario import get_usuario_by_email
from app.schemas.auth import LoginRequest, Token

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Autenticar usuario y devolver JWT."""
    usuario = get_usuario_by_email(db, login_data.email)
    if not usuario or not verify_password(login_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado",
        )

    access_token = create_access_token(
        data={"sub": str(usuario.id), "email": usuario.email, "rol": usuario.rol.nombre}
    )
    return Token(access_token=access_token)

