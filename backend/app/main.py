import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.db.session import engine, Base
from app.models import user, document 
from app.api.v1.endpoints import auth, docs

# --- LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- DB INIT ---
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DocuSign Clone API", version="1.0.0")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- STATIC FILES (The 404 Fix) ---
# This gets the absolute path to the 'backend' folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

# Create folders if they disappeared
os.makedirs(os.path.join(UPLOADS_DIR, "documents"), exist_ok=True)
os.makedirs(os.path.join(UPLOADS_DIR, "signatures"), exist_ok=True)

# Mount the directory
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# --- ROUTERS ---
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(docs.router, prefix="/api/v1/docs", tags=["Docs"])

@app.on_event("startup")
async def startup_event():
    logger.info(f"PDFs served from: {os.path.abspath(UPLOADS_DIR)}")

@app.get("/")
def read_root():
    return {"status": "Online", "static_url": "/uploads"}