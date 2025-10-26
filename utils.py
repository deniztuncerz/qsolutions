"""
Utility functions for Q Solutions API
"""
import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from dotenv import load_dotenv
import asyncio
from typing import Dict, Any

# Load environment variables
load_dotenv()

def get_google_sheets_client():
    """
    Authenticate and return Google Sheets client
    """
    try:
        # Path to the service account JSON file
        credentials_file = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE", "credentials.json")
        
        # Define the scope
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        
        # Authenticate using the service account
        credentials = ServiceAccountCredentials.from_json_keyfile_name(credentials_file, scope)
        client = gspread.authorize(credentials)
        
        return client
    except Exception as e:
        print(f"Error authenticating with Google Sheets: {e}")
        return None

def append_quote_to_sheet(quote_data: Dict[str, Any]) -> bool:
    """
    Append quote data to Google Sheet
    """
    try:
        client = get_google_sheets_client()
        if not client:
            return False
            
        # Get the sheet ID from environment
        sheet_id = os.getenv("GOOGLE_SHEET_ID")
        if not sheet_id:
            print("GOOGLE_SHEET_ID not found in environment variables")
            return False
            
        # Open the spreadsheet
        spreadsheet = client.open_by_key(sheet_id)
        
        # Get the first worksheet
        worksheet = spreadsheet.sheet1
        
        # Prepare the row data
        row_data = [
            quote_data.get('tracking_code', ''),
            quote_data.get('created_at', ''),
            quote_data.get('full_name', ''),
            quote_data.get('email', ''),
            quote_data.get('phone', ''),
            quote_data.get('city', ''),
            quote_data.get('device_type', ''),
            quote_data.get('brand', ''),
            quote_data.get('model', ''),
            quote_data.get('issue_description', '')
        ]
        
        # Append the row
        worksheet.append_row(row_data)
        
        print(f"Successfully added quote {quote_data.get('tracking_code')} to Google Sheet")
        return True
        
    except Exception as e:
        print(f"Error appending to Google Sheet: {e}")
        return False

async def append_quote_async(quote_data: Dict[str, Any]):
    """
    Asynchronously append quote data to Google Sheet
    """
    # Run the synchronous function in a thread pool
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, append_quote_to_sheet, quote_data)









