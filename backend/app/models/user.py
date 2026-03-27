from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Metadata for security and tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # --- RELATIONSHIPS ---
    
    # 1. Documents uploaded/owned by this user
    # Maps to: Document.owner
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    
    # 2. Signature requests assigned to this user
    # Maps to: Signature.user
    # This was the missing link causing your 500 error!
    signatures = relationship("Signature", back_populates="user")

    def __repr__(self):
        return f"<User(email='{self.email}', name='{self.full_name}')>"