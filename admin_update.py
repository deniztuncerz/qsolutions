#!/usr/bin/env python3
"""
Q Solutions - Admin Status Update Script
Simple script to update repair statuses via command line
"""

import requests
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_BASE_URL = "http://localhost:8000"
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")

def update_status(tracking_code, status_message):
    """Update repair status"""
    if not ADMIN_API_KEY:
        print("❌ ADMIN_API_KEY not found in environment variables")
        return False
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/v1/admin/update_status",
            json={
                "tracking_code": tracking_code,
                "status_message": status_message
            },
            headers={
                "Content-Type": "application/json",
                "X-API-KEY": ADMIN_API_KEY
            }
        )
        
        if response.status_code == 200:
            print(f"✅ Status updated successfully for {tracking_code}")
            print(f"   New status: {status_message}")
            return True
        else:
            print(f"❌ Failed to update status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error updating status: {e}")
        return False

def main():
    """Main function"""
    print("🔧 Q Solutions - Admin Status Update")
    print("=" * 40)
    
    if len(sys.argv) != 3:
        print("Usage: python admin_update.py <tracking_code> <status_message>")
        print("\nExamples:")
        print("  python admin_update.py QS-123456 'Device received and under diagnosis'")
        print("  python admin_update.py QS-123456 'Repair completed, ready for pickup'")
        sys.exit(1)
    
    tracking_code = sys.argv[1]
    status_message = sys.argv[2]
    
    print(f"Tracking Code: {tracking_code}")
    print(f"Status Message: {status_message}")
    print("-" * 40)
    
    success = update_status(tracking_code, status_message)
    
    if success:
        print("\n🎉 Status update completed successfully!")
    else:
        print("\n❌ Status update failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()









