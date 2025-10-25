#!/usr/bin/env python3
"""
Q Solutions - API Test Script
Test the API endpoints to ensure everything is working correctly
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_QUOTE_DATA = {
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "city": "New York",
    "device_type": "Inverter",
    "brand": "Solax",
    "model": "X1-Hybrid-5.0",
    "issue_description": "Device not producing power, error code E001"
}

def test_health_endpoint():
    """Test the health check endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/health")
        if response.status_code == 200:
            print("[OK] Health check passed")
            return True
        else:
            print(f"[ERROR] Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to server. Is it running?")
        return False
    except Exception as e:
        print(f"[ERROR] Health check error: {e}")
        return False

def test_quote_submission():
    """Test quote submission endpoint"""
    print("Testing quote submission...")
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/v1/submit_quote",
            json=TEST_QUOTE_DATA,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Quote submitted successfully")
            print(f"   Tracking Code: {data.get('tracking_code')}")
            return data.get('tracking_code')
        else:
            print(f"[ERROR] Quote submission failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"[ERROR] Quote submission error: {e}")
        return None

def test_tracking(tracking_code):
    """Test tracking endpoint"""
    if not tracking_code:
        print("[SKIP] Skipping tracking test (no tracking code)")
        return False
    
    print(f"Testing tracking for code: {tracking_code}")
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/track/{tracking_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("[OK] Tracking successful")
            print(f"   Status: {data.get('current_status')}")
            print(f"   Last Updated: {data.get('last_updated_at')}")
            return True
        else:
            print(f"[ERROR] Tracking failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Tracking error: {e}")
        return False

def test_frontend():
    """Test if frontend is accessible"""
    print("Testing frontend...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200 and "Q Solutions" in response.text:
            print("[OK] Frontend accessible")
            return True
        else:
            print(f"[ERROR] Frontend not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Frontend error: {e}")
        return False

def test_api_docs():
    """Test if API documentation is accessible"""
    print("Testing API documentation...")
    try:
        response = requests.get(f"{API_BASE_URL}/docs")
        if response.status_code == 200:
            print("[OK] API documentation accessible")
            return True
        else:
            print(f"[ERROR] API documentation not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] API documentation error: {e}")
        return False

def main():
    """Main test function"""
    print("Q Solutions - API Test Suite")
    print("=" * 50)
    
    # Test results
    results = {
        'health': False,
        'frontend': False,
        'docs': False,
        'quote': False,
        'tracking': False
    }
    
    # Run tests
    results['health'] = test_health_endpoint()
    
    if not results['health']:
        print("\n[ERROR] Server is not running. Please start the server first:")
        print("   python main.py")
        sys.exit(1)
    
    results['frontend'] = test_frontend()
    results['docs'] = test_api_docs()
    
    tracking_code = test_quote_submission()
    results['quote'] = tracking_code is not None
    
    if tracking_code:
        results['tracking'] = test_tracking(tracking_code)
    
    # Summary
    print("\n" + "=" * 50)
    print("Test Results Summary:")
    print(f"   Health Check: {'[OK]' if results['health'] else '[ERROR]'}")
    print(f"   Frontend: {'[OK]' if results['frontend'] else '[ERROR]'}")
    print(f"   API Docs: {'[OK]' if results['docs'] else '[ERROR]'}")
    print(f"   Quote Submission: {'[OK]' if results['quote'] else '[ERROR]'}")
    print(f"   Tracking: {'[OK]' if results['tracking'] else '[ERROR]'}")
    
    # Overall result
    all_passed = all(results.values())
    if all_passed:
        print("\n[SUCCESS] All tests passed! The system is working correctly.")
        print("\nAccess your application:")
        print(f"   Frontend: {API_BASE_URL}")
        print(f"   API Docs: {API_BASE_URL}/docs")
    else:
        print("\n[WARNING] Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()

