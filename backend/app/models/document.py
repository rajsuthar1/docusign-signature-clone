import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

# 1. Standardizing the Enum
class DocStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PENDING = "pending"
    SIGNED = "signed"
    COMPLETED = "completed"

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    
    # Adding a 'name' to the Enum helps SQLAlchemy manage the type in the DB
    status = Column(Enum(DocStatus, name="docstatus"), default=DocStatus.UPLOADED)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="documents")
    signatures = relationship(
        "Signature", 
        back_populates="document", 
        cascade="all, delete-orphan"
    )


class Signature(Base):
    __tablename__ = "signatures"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    user_id = Column(Integer, ForeignKey("users.id")) 
    
    x_pos = Column(Float, nullable=False) 
    y_pos = Column(Float, nullable=False)
    page_number = Column(Integer, default=1)
    
    # We use a simple string here for flexibility, or you could create a SignStatus Enum
    status = Column(String, default="pending") 
    
    signature_image_path = Column(String, nullable=True)
    signed_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="signatures")
    document = relationship("Document", back_populates="signatures")