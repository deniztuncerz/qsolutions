# Q Solutions - Advanced API-Driven SPA & Repair Tracking System

## Setup and Deployment Guide

This guide will walk you through setting up the complete Q Solutions system, including the FastAPI backend, PostgreSQL database, Google Sheets integration, and the frontend SPA.

## Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher
- Google Cloud Platform account (for Google Sheets integration)
- Git (optional, for version control)

## Phase 1: Backend Setup

### 1. Install Python Dependencies

```bash
# Install required packages
pip install -r requirements.txt
```

### 2. Database Setup

#### Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

#### Create Database
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE qsolutions_db;

-- Create user (optional, for production)
CREATE USER qsolutions_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE qsolutions_db TO qsolutions_user;
```

#### Run Database Schema
```bash
# Execute the SQL schema
psql -U postgres -d qsolutions_db -f database_schema.sql
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/qsolutions_db

# Admin API Key for status updates
ADMIN_API_KEY=your-secure-admin-api-key-here

# Google Sheets Integration
GOOGLE_SHEETS_CREDENTIALS_FILE=credentials.json
GOOGLE_SHEET_ID=your-google-sheet-id-here
```

### 4. Google Sheets Integration Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API and Google Drive API

#### Step 2: Create Service Account
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: "Q Solutions API"
4. Description: "Service account for Q Solutions Google Sheets integration"
5. Click "Create and Continue"
6. Skip role assignment for now
7. Click "Done"

#### Step 3: Generate Credentials
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file and rename it to `credentials.json`
6. Place it in your project root directory

#### Step 4: Create Google Sheet
1. Create a new Google Sheet
2. Share it with the service account email (found in credentials.json)
3. Give "Editor" permissions
4. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)

#### Step 5: Configure Sheet Headers
Add these headers to the first row of your Google Sheet:
```
Tracking Code | Created At | Full Name | Email | Phone | City | Device Type | Brand | Model | Issue Description
```

## Phase 2: Frontend Setup

The frontend is already included in the `static/` directory and will be served automatically by FastAPI.

### Frontend Features
- ✅ Semantic HTML5 structure
- ✅ Responsive CSS with CSS variables
- ✅ Smart form with cascading selects
- ✅ API integration with Fetch API
- ✅ Smooth scrolling navigation
- ✅ Mobile-responsive design
- ✅ Real-time form validation

## Phase 3: Running the Application

### 1. Start the FastAPI Server

```bash
# Development mode
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Access the Application

- **Frontend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## Phase 4: Testing the System

### 1. Test Quote Submission
1. Go to http://localhost:8000
2. Scroll to "Get Quote" section
3. Fill out the form with test data
4. Submit and note the tracking code

### 2. Test Tracking System
1. Use the tracking code from step 1
2. Go to "Track Repair" section
3. Enter the tracking code
4. Check the status

### 3. Test Admin Status Update
```bash
# Update repair status (replace with your actual tracking code and API key)
curl -X POST "http://localhost:8000/api/v1/admin/update_status" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: your-secure-admin-api-key-here" \
  -d '{
    "tracking_code": "QS-123456",
    "status_message": "Device received and under diagnosis"
  }'
```

## API Endpoints

### Public Endpoints
- `GET /` - Serve frontend
- `POST /api/v1/submit_quote` - Submit quote request
- `GET /api/v1/track/{tracking_code}` - Track repair status
- `GET /api/v1/health` - Health check

### Admin Endpoints
- `POST /api/v1/admin/update_status` - Update repair status (requires X-API-KEY header)

## Database Schema

### Quotes Table
```sql
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    issue_description TEXT NOT NULL,
    tracking_code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Repair Status Updates Table
```sql
CREATE TABLE repair_status_updates (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    status_message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Production Deployment

### 1. Environment Variables
Set these environment variables in production:
```env
DATABASE_URL=postgresql://user:pass@host:port/db
ADMIN_API_KEY=your-production-api-key
GOOGLE_SHEETS_CREDENTIALS_FILE=/path/to/credentials.json
GOOGLE_SHEET_ID=your-production-sheet-id
```

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access
- Regular backups

### 3. API Security
- Change default admin API key
- Use HTTPS in production
- Implement rate limiting
- Add request logging

### 4. Server Configuration
- Use a production WSGI server (Gunicorn + Uvicorn)
- Set up reverse proxy (Nginx)
- Configure SSL certificates
- Set up monitoring and logging

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError)
```
**Solution**: Check DATABASE_URL in .env file and ensure PostgreSQL is running.

#### 2. Google Sheets Authentication Error
```
gspread.exceptions.SpreadsheetNotFound
```
**Solution**: Verify credentials.json and sheet sharing permissions.

#### 3. CORS Issues
**Solution**: The CORS middleware is configured for development. For production, update the `allow_origins` list.

#### 4. Form Validation Issues
**Solution**: Check browser console for JavaScript errors and ensure all required fields are filled.

### Debug Mode
Enable debug logging by setting:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## File Structure

```
qsolutions/
├── main.py                 # FastAPI application
├── models.py               # SQLAlchemy models
├── schemas.py              # Pydantic schemas
├── database.py             # Database configuration
├── utils.py                # Google Sheets integration
├── requirements.txt        # Python dependencies
├── database_schema.sql     # Database schema
├── env.example            # Environment variables template
├── credentials.json        # Google service account credentials
├── static/                # Frontend files
│   ├── index.html         # Main HTML file
│   ├── style.css          # CSS styles
│   └── script.js          # JavaScript functionality
└── SETUP_GUIDE.md         # This guide
```

## Support

For technical support or questions about the Q Solutions system:

1. Check the troubleshooting section above
2. Review the API documentation at `/docs`
3. Check the browser console for JavaScript errors
4. Verify all environment variables are set correctly

## Next Steps

1. **Customization**: Modify the CSS variables in `style.css` to match your brand
2. **Features**: Add email notifications, SMS alerts, or advanced reporting
3. **Mobile App**: Use the API endpoints to build iOS/Android apps
4. **Analytics**: Integrate Google Analytics or other tracking tools
5. **Backup**: Set up automated database backups and Google Sheets exports

The system is now ready for production use with a modern, responsive interface and robust API backend!







