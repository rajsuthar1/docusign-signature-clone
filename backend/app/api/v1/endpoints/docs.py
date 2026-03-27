import os
import shutil
import base64
import fitz  # PyMuPDF
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import Document, Signature, DocStatus
from app.schemas.document import SignaturePlacement

router = APIRouter()

# --- PATH CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "documents")
SIG_IMAGE_DIR = os.path.join(BASE_DIR, "uploads", "signatures")

# Ensure directories exist
for path in [UPLOAD_DIR, SIG_IMAGE_DIR]:
    os.makedirs(path, exist_ok=True)

# --- PDF UTILITY FUNCTION ---
def overlay_signature_on_pdf(input_path, output_path, sig_img_path, x_percent, y_percent, page_num=0):
    """Permanently embeds the signature PNG into the PDF bytes."""
    try:
        doc = fitz.open(input_path)
        page = doc[page_num]
        
        # Map percentages to PDF points
        width = page.rect.width
        height = page.rect.height
        
        sig_w, sig_h = 120, 60 # Standard signature dimensions
        abs_x = (x_percent / 100) * width
        abs_y = (y_percent / 100) * height
        
        # Define the box for the signature
        rect = fitz.Rect(
            abs_x - (sig_w / 2), abs_y - (sig_h / 2),
            abs_x + (sig_w / 2), abs_y + (sig_h / 2)
        )
        
        page.insert_image(rect, filename=sig_img_path)
        doc.save(output_path)
        doc.close()
        return True
    except Exception as e:
        print(f"PDF Overlay Error: {e}")
        return False

# --- ENDPOINTS ---

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    safe_filename = file.filename.replace(" ", "_")
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_doc = Document(
        filename=safe_filename,
        file_path=f"/uploads/documents/{safe_filename}", 
        status=DocStatus.UPLOADED,
        owner_id=1 
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return {"message": "File uploaded", "doc_id": new_doc.id}

@router.get("/")
def list_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).all()
    return [{
        "id": d.id, "filename": d.filename, "created_at": d.created_at,
        "status": d.status, "file_path": d.file_path, "signature_count": len(d.signatures)
    } for d in documents]

@router.get("/{doc_id}")
def get_document_details(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc: raise HTTPException(status_code=404)
    
    return {
        "id": doc.id, "filename": doc.filename, "file_path": doc.file_path, "status": doc.status,
        "signatures": [{"id": s.id, "x_pos": s.x_pos, "y_pos": s.y_pos, 
                        "status": s.status, "page": s.page_number, 
                        "signature_image_path": s.signature_image_path} for s in doc.signatures]
    }

@router.post("/sign-position")
async def save_signature_position(placement: SignaturePlacement, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == placement.document_id).first()
    if not doc: raise HTTPException(status_code=404)

    new_sig = Signature(
        document_id=placement.document_id, user_id=1,
        x_pos=placement.x_pos, y_pos=placement.y_pos,
        page_number=placement.page_number, status="pending"
    )
    doc.status = DocStatus.PENDING
    db.add(new_sig)
    db.commit()
    return {"status": "success", "sig_id": new_sig.id}

@router.patch("/signatures/{sig_id}/finalize")
async def finalize_signature(sig_id: int, image_data: dict, db: Session = Depends(get_db)):
    sig = db.query(Signature).filter(Signature.id == sig_id).first()
    if not sig: raise HTTPException(status_code=404)

    try:
        # 1. Save PNG Signature Image
        encoded_data = image_data['image'].split(",")[1]
        decoded_img = base64.b64decode(encoded_data)
        sig_filename = f"sig_{sig_id}.png"
        sig_filepath = os.path.join(SIG_IMAGE_DIR, sig_filename)
        
        with open(sig_filepath, "wb") as f:
            f.write(decoded_img)
            
        sig.signature_image_path = f"/uploads/signatures/{sig_filename}"
        sig.status = "signed"

        # 2. PDF Burn-In Logic
        doc = sig.document
        original_pdf_abs = os.path.join(BASE_DIR, doc.file_path.lstrip('/'))
        signed_pdf_name = f"SIGNED_{doc.filename}"
        signed_pdf_abs = os.path.join(UPLOAD_DIR, signed_pdf_name)

        # Apply signature to the PDF file
        pdf_success = overlay_signature_on_pdf(
            original_pdf_abs, signed_pdf_abs, sig_filepath, 
            sig.x_pos, sig.y_pos, sig.page_number - 1
        )

        if pdf_success:
            doc.file_path = f"/uploads/documents/{signed_pdf_name}"
            if all(s.status == "signed" for s in doc.signatures):
                doc.status = DocStatus.COMPLETED
        
        db.commit()
        return {"message": "PDF signed and generated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))