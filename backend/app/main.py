# main.py snippet
from .routers import auth, chat, conversations, admin
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(conversations.router)
app.include_router(admin.router)
