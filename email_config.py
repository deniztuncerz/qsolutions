"""
Email configuration and templates for Q Solutions
"""
import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email configuration
email_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "info@qsolutions.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "your-corporate-email-password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "info@qsolutions.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() == "true",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() == "true",
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Email templates
def get_quote_confirmation_template(tracking_code: str, customer_name: str) -> str:
    """
    Email template for quote confirmation
    """
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">Q Solutions - Teklif Onayi</h2>
            
            <p>Merhaba {customer_name},</p>
            
            <p>Teklif talebiniz başarıyla alınmıştır. Aşağıdaki bilgilerle onarım sürecinizi takip edebilirsiniz:</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Takip Kodu: <span style="color: #e74c3c; font-weight: bold;">{tracking_code}</span></h3>
            </div>
            
            <p><strong>Sonraki Adımlar:</strong></p>
            <ul>
                <li>Teklifiniz değerlendirilecek</li>
                <li>Size geri dönüş yapılacak</li>
                <li>Onarım süreci başlatılacak</li>
            </ul>
            
            <p>Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #7f8c8d; font-size: 14px;">
                    Q Solutions - İleri Teknoloji Hizmetleri<br>
                    Email: info@qsolutions.com | Tel: +90 (212) 555-0123
                </p>
            </div>
        </div>
    </body>
    </html>
    """

def get_admin_notification_template(tracking_code: str, customer_name: str, device_type: str, issue: str) -> str:
    """
    Email template for admin notification
    """
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">Yeni Teklif Talebi</h2>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Teklif Detayları</h3>
                <p><strong>Takip Kodu:</strong> {tracking_code}</p>
                <p><strong>Müşteri:</strong> {customer_name}</p>
                <p><strong>Cihaz Tipi:</strong> {device_type}</p>
                <p><strong>Sorun:</strong> {issue}</p>
            </div>
            
            <p style="color: #e74c3c; font-weight: bold;">Bu teklif degerlendirilmeyi bekliyor!</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:8000" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Sisteme Git
                </a>
            </div>
        </div>
    </body>
    </html>
    """

def get_status_update_template(tracking_code: str, customer_name: str, status: str) -> str:
    """
    Email template for status updates
    """
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">Durum Guncellemesi</h2>
            
            <p>Merhaba {customer_name},</p>
            
            <p>Takip kodunuz <strong>{tracking_code}</strong> için durum güncellemesi:</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db;">
                <h3 style="color: #2c3e50; margin-top: 0;">Güncel Durum</h3>
                <p style="font-size: 18px; color: #2c3e50; font-weight: bold;">{status}</p>
            </div>
            
            <p>Detaylı takip için web sitemizi ziyaret edebilirsiniz.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:8000" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Durumu Takip Et
                </a>
            </div>
        </div>
    </body>
    </html>
    """
