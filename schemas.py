"""
Pydantic schemas for Q Solutions API request/response validation
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class QuoteCreate(BaseModel):
    """
    Schema for quote creation request
    """
    full_name: str
    email: EmailStr
    phone: str
    city: str
    device_type: str
    brand: str
    model: str
    issue_description: str

class QuoteDisplay(BaseModel):
    """
    Schema for quote display response
    """
    id: int
    full_name: str
    email: str
    phone: str
    city: str
    device_type: str
    brand: str
    model: str
    issue_description: str
    tracking_code: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class StatusUpdateCreate(BaseModel):
    """
    Schema for status update request
    """
    tracking_code: str
    new_status_message: str

class StatusDisplay(BaseModel):
    """
    Schema for status display response
    """
    tracking_code: str
    current_status: str
    last_updated_at: datetime

class AdminStatusUpdate(BaseModel):
    """
    Schema for admin status update
    """
    tracking_code: str
    status_message: str

