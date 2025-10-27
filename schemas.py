"""
Pydantic schemas for Q Solutions API - SECURE VERSION with enhanced validation
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional
import re

class QuoteCreate(BaseModel):
    """
    Schema for quote creation request with enhanced validation
    """
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Customer's full name",
        example="John Doe"
    )
    email: EmailStr = Field(
        ...,
        description="Valid email address",
        example="john.doe@example.com"
    )
    phone: str = Field(
        ...,
        min_length=10,
        max_length=20,
        description="Phone number (digits, spaces, + allowed)",
        example="+905551234567"
    )
    city: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="City name",
        example="Istanbul"
    )
    device_type: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Type of device",
        example="Inverter"
    )
    brand: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Device brand",
        example="Huawei"
    )
    model: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Device model",
        example="SUN2000-5KTL"
    )
    issue_description: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Detailed description of the issue",
        example="Device is not powering on, LED lights are not working"
    )
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        """
        Validate phone number format
        - Allows: digits, spaces, hyphens, parentheses, +
        - Length: 10-20 characters after removing spaces
        """
        # Remove spaces for validation
        clean_phone = v.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        
        # Check format: optional + followed by digits
        if not re.match(r'^\+?[0-9]{10,15}$', clean_phone):
            raise ValueError('Invalid phone number format. Use digits only, e.g., +905551234567')
        
        return v
    
    @field_validator('full_name', 'city', 'brand', 'model')
    @classmethod
    def validate_text_fields(cls, v):
        """
        Validate text fields for XSS and injection attacks
        """
        # Strip whitespace
        v = v.strip()
        
        # Check for dangerous characters
        dangerous_chars = ['<', '>', 'script', 'javascript:', 'onerror=', 'onclick=']
        v_lower = v.lower()
        
        for char in dangerous_chars:
            if char in v_lower:
                raise ValueError(f'Invalid characters detected')
        
        # Check for SQL injection patterns
        sql_patterns = ['--', ';--', 'drop table', 'insert into', 'delete from', 'union select']
        for pattern in sql_patterns:
            if pattern in v_lower:
                raise ValueError(f'Invalid content detected')
        
        return v
    
    @field_validator('issue_description')
    @classmethod
    def validate_description(cls, v):
        """
        Validate issue description
        """
        # Strip whitespace
        v = v.strip()
        
        # Basic XSS check
        if '<script' in v.lower() or 'javascript:' in v.lower():
            raise ValueError('Invalid characters detected in description')
        
        # Check for excessive special characters (potential attack)
        special_char_count = sum(1 for c in v if not c.isalnum() and not c.isspace())
        if special_char_count > len(v) * 0.3:  # More than 30% special chars
            raise ValueError('Description contains too many special characters')
        
        return v
    
    @field_validator('device_type')
    @classmethod
    def validate_device_type(cls, v):
        """
        Validate device type against allowed values
        """
        allowed_types = ['Inverter', 'HV Battery', 'LV Battery', 'Solar Panel', 'Charge Controller']
        if v not in allowed_types:
            raise ValueError(f'Invalid device type. Allowed: {", ".join(allowed_types)}')
        return v

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
    tracking_code: str = Field(
        ...,
        min_length=11,
        max_length=11,
        pattern="^QS-[A-Z0-9]{8}$",
        description="Tracking code format: QS-XXXXXXXX",
        example="QS-A7K9M2P5"
    )
    new_status_message: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Status update message",
        example="Repair in progress"
    )
    
    @field_validator('new_status_message')
    @classmethod
    def validate_status_message(cls, v):
        """
        Validate status message
        """
        v = v.strip()
        
        # Basic XSS check
        if '<' in v or '>' in v or 'script' in v.lower():
            raise ValueError('Invalid characters detected in status message')
        
        return v

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
    tracking_code: str = Field(
        ...,
        min_length=11,
        max_length=11,
        pattern="^QS-[A-Z0-9]{8}$",
        description="Tracking code format: QS-XXXXXXXX",
        example="QS-A7K9M2P5"
    )
    status_message: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Status update message",
        example="Repair completed"
    )
    
    @field_validator('status_message')
    @classmethod
    def validate_status_message(cls, v):
        """
        Validate status message
        """
        v = v.strip()
        
        # XSS check
        if '<' in v or '>' in v or 'script' in v.lower():
            raise ValueError('Invalid characters detected in status message')
        
        return v

# Additional schemas for future features

class QuoteFilter(BaseModel):
    """
    Schema for filtering quotes (admin panel)
    """
    device_type: Optional[str] = None
    city: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    status: Optional[str] = None
    
class QuoteStats(BaseModel):
    """
    Schema for quote statistics
    """
    total_quotes: int
    quotes_by_device_type: dict
    quotes_by_city: dict
    quotes_by_status: dict
    average_resolution_time: Optional[float] = None

class HealthCheck(BaseModel):
    """
    Schema for health check response
    """
    status: str
    service: str
    version: str
    timestamp: datetime
    database_status: Optional[str] = None
    google_sheets_status: Optional[str] = None

