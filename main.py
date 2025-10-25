"""
Q Solutions - Advanced API-Driven SPA & Repair Tracking System
FastAPI Backend Application
"""
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, engine
from models import Quote, RepairStatusUpdate, Base
from schemas import QuoteCreate, QuoteDisplay, StatusUpdateCreate, StatusDisplay, AdminStatusUpdate
from utils import append_quote_async

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Q Solutions API",
    description="Advanced API-Driven SPA & Repair Tracking System",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving the frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Admin API Key dependency
def verify_admin_api_key(x_api_key: str = Header(None)):
    """
    Dependency to verify admin API key
    """
    admin_key = os.getenv("ADMIN_API_KEY")
    if not admin_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin API key not configured"
        )
    
    if x_api_key != admin_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return True

def generate_tracking_code() -> str:
    """
    Generate a unique tracking code
    """
    # Generate a simple tracking code like QS-1001, QS-1002, etc.
    # In production, you might want to use a more sophisticated approach
    timestamp = str(int(datetime.now().timestamp()))[-6:]
    return f"QS-{timestamp}"

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """
    Serve the main frontend HTML page
    """
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Frontend not found. Please ensure index.html is in the static directory.</h1>")

@app.post("/api/v1/submit_quote", response_model=QuoteDisplay)
async def submit_quote(quote_data: QuoteCreate, db: Session = Depends(get_db)):
    """
    Submit a new quote request
    """
    try:
        # Generate unique tracking code
        tracking_code = generate_tracking_code()
        
        # Create quote record
        db_quote = Quote(
            full_name=quote_data.full_name,
            email=quote_data.email,
            phone=quote_data.phone,
            city=quote_data.city,
            device_type=quote_data.device_type,
            brand=quote_data.brand,
            model=quote_data.model,
            issue_description=quote_data.issue_description,
            tracking_code=tracking_code
        )
        
        db.add(db_quote)
        db.commit()
        db.refresh(db_quote)
        
        # Create initial status update
        initial_status = RepairStatusUpdate(
            quote_id=db_quote.id,
            status_message="Request Received"
        )
        db.add(initial_status)
        db.commit()
        
        # Prepare data for Google Sheets (run as background task)
        quote_dict = {
            'tracking_code': tracking_code,
            'created_at': db_quote.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'full_name': db_quote.full_name,
            'email': db_quote.email,
            'phone': db_quote.phone,
            'city': db_quote.city,
            'device_type': db_quote.device_type,
            'brand': db_quote.brand,
            'model': db_quote.model,
            'issue_description': db_quote.issue_description
        }
        
        # Run Google Sheets update in background
        await append_quote_async(quote_dict)
        
        return QuoteDisplay.model_validate(db_quote)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating quote: {str(e)}"
        )

@app.get("/api/v1/track/{tracking_code}", response_model=StatusDisplay)
async def track_repair(tracking_code: str, db: Session = Depends(get_db)):
    """
    Track repair status by tracking code
    """
    try:
        # Find the quote by tracking code
        quote = db.query(Quote).filter(Quote.tracking_code == tracking_code).first()
        
        if not quote:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tracking code not found"
            )
        
        # Get the latest status update
        latest_status = db.query(RepairStatusUpdate)\
            .filter(RepairStatusUpdate.quote_id == quote.id)\
            .order_by(desc(RepairStatusUpdate.created_at))\
            .first()
        
        if not latest_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No status updates found"
            )
        
        return StatusDisplay(
            tracking_code=tracking_code,
            current_status=latest_status.status_message,
            last_updated_at=latest_status.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving status: {str(e)}"
        )

@app.post("/api/v1/admin/update_status")
async def update_repair_status(
    status_data: AdminStatusUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_api_key)
):
    """
    Update repair status (Admin only)
    """
    try:
        # Find the quote by tracking code
        quote = db.query(Quote).filter(Quote.tracking_code == status_data.tracking_code).first()
        
        if not quote:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tracking code not found"
            )
        
        # Create new status update
        status_update = RepairStatusUpdate(
            quote_id=quote.id,
            status_message=status_data.status_message
        )
        
        db.add(status_update)
        db.commit()
        
        return {"message": f"Status updated successfully for tracking code {status_data.tracking_code}"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating status: {str(e)}"
        )

@app.get("/api/v1/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "Q Solutions API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
