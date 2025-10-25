#!/usr/bin/env python3
"""
Gmail OAuth2 Setup Script
Bu script Gmail OAuth2 authentication için gerekli token'ları alır.
"""

import os
import pickle
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Gmail API scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def setup_gmail_oauth():
    """
    Gmail OAuth2 setup işlemi
    """
    creds = None
    
    # Token dosyası varsa yükle
    if os.path.exists('gmail_token.pickle'):
        with open('gmail_token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # Credentials yoksa veya geçersizse yeni token al
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # credentials.json dosyası gerekli
            if not os.path.exists('credentials.json'):
                print("credentials.json dosyasi bulunamadi!")
                print("Google Cloud Console'dan OAuth2 credentials indirin.")
                return None
            
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Token'ı kaydet
        with open('gmail_token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
    return creds

def get_gmail_service():
    """
    Gmail API service oluştur
    """
    creds = setup_gmail_oauth()
    if not creds:
        return None
    
    service = build('gmail', 'v1', credentials=creds)
    return service

def send_test_email():
    """
    Test email gönder
    """
    service = get_gmail_service()
    if not service:
        print("❌ Gmail service oluşturulamadı!")
        return False
    
    try:
        # Test email oluştur
        message = {
            'raw': create_message('info@qsolutions.com', 'test@example.com', 'Test Email', 'Bu bir test emailidir.')
        }
        
        # Email gönder
        result = service.users().messages().send(userId='me', body=message).execute()
        print(f"Test email basariyla gonderildi! Message ID: {result['id']}")
        return True
        
    except Exception as e:
        print(f"Email gonderilemedi: {e}")
        return False

def create_message(sender, to, subject, message_text):
    """
    Gmail API için message oluştur
    """
    import base64
    from email.mime.text import MIMEText
    
    message = MIMEText(message_text)
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    return raw

if __name__ == "__main__":
    print("Gmail OAuth2 Setup")
    print("=" * 50)
    
    # OAuth2 setup
    creds = setup_gmail_oauth()
    if creds:
        print("Gmail OAuth2 basariyla kuruldu!")
        print(f"Access Token: {creds.token[:20]}...")
        print(f"Refresh Token: {creds.refresh_token[:20]}...")
        
        # Test email gönder
        print("\nTest email gonderiliyor...")
        if send_test_email():
            print("Gmail OAuth2 setup tamamlandi!")
        else:
            print("Test email gonderilemedi, ancak OAuth2 kuruldu.")
    else:
        print("Gmail OAuth2 setup basarisiz!")