# routers/conversations.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, database, auth
from ..database import get_db

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

@router.get("/", response_model=list[schemas.ConversationOut])
def list_conversations(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # only return conversations of this user (admins can see all - optional)
    if current_user.is_admin:
        convs = db.query(models.Conversation).all()
    else:
        convs = db.query(models.Conversation).filter(models.Conversation.owner_id == current_user.id).all()
    return convs

@router.post("/", response_model=schemas.ConversationOut)
def create_conv(data: schemas.ConversationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    conv = models.Conversation(title=data.title, owner_id=current_user.id)
    db.add(conv); db.commit(); db.refresh(conv)
    for m in data.messages or []:
        msg = models.Message(conversation_id=conv.id, role=m.role, content=m.content)
        db.add(msg)
    db.commit(); db.refresh(conv)
    return conv

@router.get("/{conv_id}", response_model=schemas.ConversationOut)
def get_conv(conv_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    conv = db.query(models.Conversation).filter(models.Conversation.id==conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    # owner check
    if not current_user.is_admin and conv.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation")
    return conv
