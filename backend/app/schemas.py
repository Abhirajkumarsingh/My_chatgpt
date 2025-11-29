# schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool
    class Config:
        orm_mode = True

class MessageCreate(BaseModel):
    role: str  # "user" / "assistant"
    content: str

class ConversationCreate(BaseModel):
    title: Optional[str] = "New conversation"
    messages: Optional[List[MessageCreate]] = []

class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    class Config:
        orm_mode = True

class ConversationOut(BaseModel):
    id: int
    title: str
    owner_id: int
    messages: List[MessageOut] = []
    created_at: datetime
    class Config:
        orm_mode = True

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    prompt: str
    max_tokens: Optional[int] = 256
    temperature: Optional[float] = 0.7
