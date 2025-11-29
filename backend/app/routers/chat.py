# routers/chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, database, auth
from ..database import get_db
from ..services.hf_client import call_hf

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat")
def chat(req: schemas.ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is empty")

    # find or create conversation
    conv = None
    if req.conversation_id:
        conv = db.query(models.Conversation).filter(models.Conversation.id == req.conversation_id).first()
        if conv is None:
            raise HTTPException(404, "Conversation not found")
        if conv.owner_id != current_user.id and not current_user.is_admin:
            raise HTTPException(403, "Not allowed")
    else:
        conv = models.Conversation(title="Conversation", owner_id=current_user.id)
        db.add(conv); db.commit(); db.refresh(conv)

    # save user message
    user_msg = models.Message(conversation_id=conv.id, role="user", content=req.prompt)
    db.add(user_msg); db.commit(); db.refresh(user_msg)

    # stitch last few messages
    msgs = db.query(models.Message).filter(models.Message.conversation_id==conv.id).order_by(models.Message.created_at.desc()).limit(8).all()
    stitched = "\n".join([f"{m.role}: {m.content}" for m in reversed(msgs)])
    prompt_text = stitched + f"\nAssistant:"

    # call HF
    resp = call_hf(prompt_text, max_new_tokens=req.max_tokens, temperature=req.temperature)
    if "error" in resp:
        raise HTTPException(status_code=502, detail=resp["error"])

    assistant_text = resp.get("text", "")

    # save assistant reply
    assistant_msg = models.Message(conversation_id=conv.id, role="assistant", content=assistant_text)
    db.add(assistant_msg); db.commit()

    return {"conversation_id": conv.id, "response": assistant_text}
