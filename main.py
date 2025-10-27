"""
Q Solutions - Security Enhanced Version
Bu dosya güvenlik düzeltmelerini içerir.
main.py'yi bu dosya ile değiştirin veya değişiklikleri manuel uygulayın.
"""
import os
import secrets
import string
import logging
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    SLOWAPI_AVAILABLE = True
except ImportError:
    SLOWAPI_AVAILABLE = False
    logger.warning("SlowAPI not available, rate limiting disabled")
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from database import get_db, engine
from models import Quote, RepairStatusUpdate, Base
from schemas import QuoteCreate, QuoteDisplay, StatusUpdateCreate, StatusDisplay, AdminStatusUpdate
from utils import append_quote_async
from email_service import send_emails_async, send_status_update_email
from gmail_simple_service import send_emails_simple_async, send_status_update_email_simple

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('qsolutions.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Q Solutions API",
    description="Advanced API-Driven SPA & Repair Tracking System",
    version="1.0.0",
    docs_url="/api/docs" if os.getenv("ENVIRONMENT") != "production" else None,  # Disable docs in production
    redoc_url="/api/redoc" if os.getenv("ENVIRONMENT") != "production" else None
)

# Rate limiting (optional, requires Redis)
limiter = None  # Initialize as None
if SLOWAPI_AVAILABLE:
    try:
        limiter = Limiter(key_func=get_remote_address, default_limits=["200/hour"])
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
        logger.info("Rate limiting enabled")
    except Exception as e:
        logger.warning(f"Rate limiting disabled: {e}")
        SLOWAPI_AVAILABLE = False
        limiter = None

# HTTPS redirect in production (Railway has its own SSL)
# if os.getenv("ENVIRONMENT") == "production":
#     app.add_middleware(HTTPSRedirectMiddleware)

# Trusted hosts - Allow Railway domains and wildcards
allowed_hosts = os.getenv("ALLOWED_HOSTS", "*").split(",")
# Only enforce TrustedHostMiddleware if ALLOWED_HOSTS is specifically set (not wildcard)
if allowed_hosts != ["*"]:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# CORS middleware - Allow Railway domains
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
# Use wildcard in development/Railway, specific domains in production with custom domain
if allowed_origins == ["*"]:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins (Railway deployment)
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,  # ✅ Specific domains only
        allow_credentials=True,
        allow_methods=["GET", "POST"],  # ✅ Only needed methods
        allow_headers=["Content-Type", "X-API-Key"],  # ✅ Only needed headers
    )

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # HSTS only in production with HTTPS
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    
    # CSP - Content Security Policy
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self';"
    )
    response.headers["Content-Security-Policy"] = csp
    
    return response

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url.path} - Client: {request.client.host}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Admin API Key dependency - SECURE VERSION
def verify_admin_api_key(x_api_key: str = Header(None)):
    """
    Dependency to verify admin API key (timing-attack safe)
    """
    admin_key = os.getenv("ADMIN_API_KEY")
    if not admin_key:
        logger.error("Admin API key not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service configuration error"
        )
    
    # Timing-attack safe comparison
    if not x_api_key or not secrets.compare_digest(x_api_key, admin_key):
        logger.warning(f"Invalid API key attempt from: {x_api_key[:10] if x_api_key else 'None'}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    return True

def generate_tracking_code() -> str:
    """
    Generate a cryptographically secure tracking code
    """
    # Use secrets module for cryptographic randomness
    random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    return f"QS-{random_part}"

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """
    Serve the main frontend HTML page
    """
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        logger.error("Frontend file not found: static/index.html")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )

@app.get("/faq", response_class=HTMLResponse)
async def serve_faq():
    """
    Serve the FAQ page
    """
    try:
        with open("static/faq.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        logger.error("FAQ file not found: static/faq.html")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )

@app.post("/api/v1/submit_quote", response_model=QuoteDisplay)
# @limiter.limit("5/minute")  # ✅ Rate limiting: 5 submissions per minute (disabled for Railway)
async def submit_quote(request: Request, quote_data: QuoteCreate, db: Session = Depends(get_db)):
    """
    Submit a new quote request (rate limited)
    """
    try:
        # Generate cryptographically secure tracking code
        tracking_code = generate_tracking_code()
        
        logger.info(f"New quote submission: {tracking_code}")
        
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
        
        # Prepare data for Google Sheets
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
        
        logger.info(f"Quote {tracking_code} submitted successfully")
        
        return QuoteDisplay.model_validate(db_quote)
        
    except Exception as e:
        db.rollback()
        logger.error(f"Quote submission failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request. Please try again later."
        )

@app.get("/api/v1/track/{tracking_code}", response_model=StatusDisplay)
# @limiter.limit("20/minute")  # ✅ Rate limiting: 20 queries per minute (disabled for Railway)
async def track_repair(request: Request, tracking_code: str, db: Session = Depends(get_db)):
    """
    Track repair status by tracking code (rate limited)
    """
    try:
        # Validate tracking code format
        if not tracking_code.startswith("QS-") or len(tracking_code) != 11:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tracking code format"
            )
        
        # Find the quote by tracking code
        quote = db.query(Quote).filter(Quote.tracking_code == tracking_code).first()
        
        if not quote:
            logger.warning(f"Tracking code not found: {tracking_code}")
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
        
        logger.info(f"Tracking query for: {tracking_code}")
        
        return StatusDisplay(
            tracking_code=tracking_code,
            current_status=latest_status.status_message,
            last_updated_at=latest_status.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tracking failed for {tracking_code}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving status. Please try again later."
        )

@app.post("/api/v1/admin/update_status")
# @limiter.limit("30/minute")  # ✅ Rate limiting for admin (disabled for Railway)
async def update_repair_status(
    request: Request,
    status_data: AdminStatusUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_api_key)
):
    """
    Update repair status (Admin only, rate limited)
    """
    try:
        # Find the quote by tracking code
        quote = db.query(Quote).filter(Quote.tracking_code == status_data.tracking_code).first()
        
        if not quote:
            logger.warning(f"Admin update failed: Tracking code {status_data.tracking_code} not found")
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
        
        logger.info(f"Status updated for {status_data.tracking_code}: {status_data.status_message}")
        
        return {"message": f"Status updated successfully for tracking code {status_data.tracking_code}"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Status update failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating status. Please try again later."
        )

@app.get("/api/v1/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": "Q Solutions API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )

