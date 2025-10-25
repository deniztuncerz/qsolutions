"""
SQLAlchemy models for Q Solutions API
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Quote(Base):
    """
    Quote model for storing customer quote requests
    """
    __tablename__ = "quotes"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False)
    device_type = Column(String(100), nullable=False)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    issue_description = Column(Text, nullable=False)
    tracking_code = Column(String(20), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to repair status updates
    status_updates = relationship("RepairStatusUpdate", back_populates="quote", cascade="all, delete-orphan")

class RepairStatusUpdate(Base):
    """
    Repair status update model for tracking repair progress
    """
    __tablename__ = "repair_status_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False)
    status_message = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to quote
    quote = relationship("Quote", back_populates="status_updates")

