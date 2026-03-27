from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- SIGNATURE SCHEMAS ---
class SignatureBase(BaseModel):
    document_id: int  # Added this so the backend knows which doc to link
    page_number: int = 1
    x_pos: float  # The percentage (0-100)
    y_pos: float  # The percentage (0-100)

class SignaturePlacement(SignatureBase):
    """
    This matches the name used in your docs.py endpoint.
    It handles the initial placement of the blue 'Sign Here' box.
    """
    pass

class SignatureResponse(SignatureBase):
    id: int
    status: str
    signature_image_path: Optional[str] = None

    class Config:
        from_attributes = True


# --- DOCUMENT SCHEMAS ---
class DocumentBase(BaseModel):
    filename: str
    file_path: str

class DocumentCreate(DocumentBase):
    owner_id: int

class DocumentResponse(DocumentBase):
    id: int
    owner_id: int
    status: str
    created_at: datetime
    # This nesting allows the frontend to see signatures immediately
    signatures: List[SignatureResponse] = []

    class Config:
        from_attributes = True