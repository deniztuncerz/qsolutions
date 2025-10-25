"""
Gmail Simple Email Service
Gmail App Password kullanarak email gönderen basit servis
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class GmailSimpleService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.username = os.getenv("MAIL_USERNAME", "info@qsolutions.com")
        self.password = os.getenv("MAIL_PASSWORD", "")
        self.from_email = os.getenv("MAIL_FROM", "info@qsolutions.com")
    
    def send_email(self, to_email, subject, body_html):
        """Email gönder"""
        try:
            # SMTP bağlantısı
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.username, self.password)
            
            # Email oluştur
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # HTML body ekle
            html_part = MIMEText(body_html, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Email gönder
            server.send_message(msg)
            server.quit()
            
            print(f"[OK] Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"[ERROR] Email sending failed: {e}")
            return False

# Global service instance
gmail_simple_service = GmailSimpleService()

async def send_quote_confirmation_email_simple(customer_email: str, customer_name: str, tracking_code: str) -> bool:
    """Simple Gmail ile quote confirmation email gönder"""
    from email_config import get_quote_confirmation_template
    
    subject = "Q Solutions - Teklif Talebiniz Alindi"
    body_html = get_quote_confirmation_template(tracking_code, customer_name)
    
    return gmail_simple_service.send_email(customer_email, subject, body_html)

async def send_admin_notification_email_simple(admin_email: str, tracking_code: str, customer_name: str, device_type: str, issue: str) -> bool:
    """Simple Gmail ile admin notification email gönder"""
    from email_config import get_admin_notification_template
    
    subject = f"Yeni Teklif Talebi: {tracking_code}"
    body_html = get_admin_notification_template(tracking_code, customer_name, device_type, issue)
    
    return gmail_simple_service.send_email(admin_email, subject, body_html)

async def send_status_update_email_simple(customer_email: str, customer_name: str, tracking_code: str, status: str) -> bool:
    """Simple Gmail ile status update email gönder"""
    from email_config import get_status_update_template
    
    subject = f"Q Solutions - Onarim Durumu Guncellemesi: {tracking_code}"
    body_html = get_status_update_template(tracking_code, customer_name, status)
    
    return gmail_simple_service.send_email(customer_email, subject, body_html)

async def send_emails_simple_async(customer_email: str, customer_name: str, tracking_code: str, device_type: str, issue: str):
    """Simple Gmail ile tüm email'leri gönder"""
    admin_email = os.getenv("ADMIN_EMAIL")
    if not admin_email:
        print("[ERROR] ADMIN_EMAIL not configured in environment variables. Skipping admin notification.")
        return

    # Email'leri sırayla gönder
    success_count = 0
    
    # Customer confirmation email
    if await send_quote_confirmation_email_simple(customer_email, customer_name, tracking_code):
        success_count += 1
    
    # Admin notification email
    if await send_admin_notification_email_simple(admin_email, tracking_code, customer_name, device_type, issue):
        success_count += 1
    
    print(f"Simple Gmail Email sending completed: {success_count}/2 emails sent successfully")
    return success_count > 0
