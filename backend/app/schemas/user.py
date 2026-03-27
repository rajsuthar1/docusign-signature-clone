from pydantic import BaseModel, EmailStr
from typing import Optional

# --- REGISTRATION SCHEMAS ---
class UserCreate(BaseModel):
    """Schema for creating a new user (Signup)"""
    email: EmailStr
    full_name: str
    password: str

# --- LOGIN SCHEMAS ---
class UserLogin(BaseModel):
    """Schema for existing user login"""
    email: EmailStr
    password: str

# --- AUTHENTICATION SCHEMAS ---
class Token(BaseModel):
    """Schema for the JWT token response"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for the data stored inside the JWT token"""
    email: Optional[str] = None

# --- OUTPUT SCHEMAS ---
class UserOut(BaseModel):
    """Schema for returning user data (hides the password)"""
    id: int
    email: EmailStr
    full_name: str

    class Config:
        from_attributes = True