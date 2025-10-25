"""
Gmail OAuth2 Email Service
Gmail OAuth2 kullanarak email gönderen servis
"""

import os
import pickle
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Gmail API scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class GmailOAuthService:
    def __init__(self):
        self.service = None
        self.setup_service()
    
    def setup_service(self):
        """Gmail OAuth2 service kurulumu"""
        creds = None
        
        # Token dosyası varsa yükle
        if os.path.exists('gmail_token.pickle'):
            with open('gmail_token.pickle', 'rb') as token:
                creds = pickle.load(token)
        
        # Credentials yoksa veya geçersizse yeni token al
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    print(f"[ERROR] Token refresh failed: {e}")
                    creds = None
            
            if not creds:
                print("[INFO] Gmail OAuth2 credentials not found. Please run gmail_oauth_setup.py first.")
                return
        
        try:
            self.service = build('gmail', 'v1', credentials=creds)
            print("[OK] Gmail OAuth2 service initialized")
        except Exception as e:
            print(f"[ERROR] Gmail service initialization failed: {e}")
    
    def create_message(self, sender, to, subject, body_html):
        """Gmail API için message oluştur"""
        message = MIMEMultipart('alternative')
        message['to'] = to
        message['from'] = sender
        message['subject'] = subject
        
        # HTML body ekle
        html_part = MIMEText(body_html, 'html', 'utf-8')
        message.attach(html_part)
        
        # Base64 encode
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        return {'raw': raw}
    
    def send_email(self, to_email, subject, body_html):
        """Email gönder"""
        if not self.service:
            print("[ERROR] Gmail service not initialized")
            return False
        
        try:
            sender = os.getenv("MAIL_FROM", "info@qsolutions.com")
            message = self.create_message(sender, to_email, subject, body_html)
            
            # Email gönder
            result = self.service.users().messages().send(
                userId='me', 
                body=message
            ).execute()
            
            print(f"[OK] Email sent successfully to {to_email}, Message ID: {result['id']}")
            return True
            
        except HttpError as error:
            print(f"[ERROR] Gmail API error: {error}")
            return False
        except Exception as e:
            print(f"[ERROR] Email sending failed: {e}")
            return False

# Global service instance
gmail_service = GmailOAuthService()

async def send_quote_confirmation_email_oauth(customer_email: str, customer_name: str, tracking_code: str) -> bool:
    """OAuth2 ile quote confirmation email gönder"""
    from email_config import get_quote_confirmation_template
    
    subject = "Q Solutions - Teklif Talebiniz Alindi"
    body_html = get_quote_confirmation_template(tracking_code, customer_name)
    
    return gmail_service.send_email(customer_email, subject, body_html)

async def send_admin_notification_email_oauth(admin_email: str, tracking_code: str, customer_name: str, device_type: str, issue: str) -> bool:
    """OAuth2 ile admin notification email gönder"""
    from email_config import get_admin_notification_template
    
    subject = f"Yeni Teklif Talebi: {tracking_code}"
    body_html = get_admin_notification_template(tracking_code, customer_name, device_type, issue)
    
    return gmail_service.send_email(admin_email, subject, body_html)

async def send_status_update_email_oauth(customer_email: str, customer_name: str, tracking_code: str, status: str) -> bool:
    """OAuth2 ile status update email gönder"""
    from email_config import get_status_update_template
    
    subject = f"Q Solutions - Onarim Durumu Guncellemesi: {tracking_code}"
    body_html = get_status_update_template(tracking_code, customer_name, status)
    
    return gmail_service.send_email(customer_email, subject, body_html)

async def send_emails_oauth_async(customer_email: str, customer_name: str, tracking_code: str, device_type: str, issue: str):
    """OAuth2 ile tüm email'leri gönder"""
    admin_email = os.getenv("ADMIN_EMAIL")
    if not admin_email:
        print("[ERROR] ADMIN_EMAIL not configured in environment variables. Skipping admin notification.")
        return

    # Email'leri sırayla gönder
    success_count = 0
    
    # Customer confirmation email
    if await send_quote_confirmation_email_oauth(customer_email, customer_name, tracking_code):
        success_count += 1
    
    # Admin notification email
    if await send_admin_notification_email_oauth(admin_email, tracking_code, customer_name, device_type, issue):
        success_count += 1
    
    print(f"OAuth2 Email sending completed: {success_count}/2 emails sent successfully")
    return success_count > 0
