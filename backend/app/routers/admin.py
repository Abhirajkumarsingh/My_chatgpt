# routers/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, database, auth, schemas

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(database.get_db), _admin = Depends(auth.get_current_admin)):
    users = db.query(models.User).all()
    return users

@router.post("/toggle_admin/{user_id}")
def toggle_admin(user_id: int, db: Session = Depends(database.get_db), admin = Depends(auth.get_current_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_admin = not user.is_admin
    db.add(user); db.commit(); db.refresh(user)
    return {"id": user.id, "is_admin": user.is_admin}
