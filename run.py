#!/usr/bin/env python3
"""
Q Solutions - Quick Start Script
Run this script to start the Q Solutions application
"""

import os
import sys
import subprocess
from pathlib import Path

def check_requirements():
    """Check if all required files exist"""
    required_files = [
        'main.py',
        'models.py', 
        'schemas.py',
        'database.py',
        'utils.py',
        'static/index.html',
        'static/style.css',
        'static/script.js'
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print("❌ Missing required files:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    
    return True

def check_env_file():
    """Check if .env file exists"""
    if not Path('.env').exists():
        print("⚠️  .env file not found. Please create one using env.example as template.")
        print("   Copy env.example to .env and configure your settings.")
        return False
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                      check=True, capture_output=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting Q Solutions server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run([sys.executable, 'main.py'])
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main function"""
    print("🔧 Q Solutions - Advanced API-Driven SPA & Repair Tracking System")
    print("=" * 70)
    
    # Check if we're in the right directory
    if not Path('main.py').exists():
        print("❌ Please run this script from the Q Solutions project directory")
        sys.exit(1)
    
    # Check requirements
    if not check_requirements():
        print("\n❌ Setup incomplete. Please ensure all files are present.")
        sys.exit(1)
    
    # Check environment file
    if not check_env_file():
        print("\n⚠️  Please configure your .env file before starting the server.")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()

