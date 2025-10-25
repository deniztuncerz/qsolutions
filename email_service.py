"""
Email service for sending notifications
"""
import asyncio
from fastapi_mail import FastMail, MessageSchema
from email_config import email_config, get_quote_confirmation_template, get_admin_notification_template, get_status_update_template
from typing import List
import os

# Initialize FastMail
fastmail = FastMail(email_config)

async def send_quote_confirmation_email(customer_email: str, customer_name: str, tracking_code: str):
    """
    Send quote confirmation email to customer
    """
    try:
        message = MessageSchema(
            subject="Q Solutions - Teklif Onayı",
            recipients=[customer_email],
            body=get_quote_confirmation_template(tracking_code, customer_name),
            subtype="html"
        )
        
        await fastmail.send_message(message)
        print(f"[OK] Quote confirmation email sent to {customer_email}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Error sending quote confirmation email: {e}")
        return False

async def send_admin_notification_email(admin_email: str, tracking_code: str, customer_name: str, device_type: str, issue: str):
    """
    Send notification email to admin
    """
    try:
        message = MessageSchema(
            subject=f"🔔 Yeni Teklif Talebi - {tracking_code}",
            recipients=[admin_email],
            body=get_admin_notification_template(tracking_code, customer_name, device_type, issue),
            subtype="html"
        )
        
        await fastmail.send_message(message)
        print(f"[OK] Admin notification email sent to {admin_email}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Error sending admin notification email: {e}")
        return False

async def send_status_update_email(customer_email: str, customer_name: str, tracking_code: str, status: str):
    """
    Send status update email to customer
    """
    try:
        message = MessageSchema(
            subject=f"📋 Durum Güncellemesi - {tracking_code}",
            recipients=[customer_email],
            body=get_status_update_template(tracking_code, customer_name, status),
            subtype="html"
        )
        
        await fastmail.send_message(message)
        print(f"[OK] Status update email sent to {customer_email}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Error sending status update email: {e}")
        return False

async def send_emails_async(customer_email: str, customer_name: str, tracking_code: str, device_type: str, issue: str):
    """
    Send both customer confirmation and admin notification emails
    """
    # Get admin email from environment
    admin_email = os.getenv("ADMIN_EMAIL", "admin@qsolutions.com")
    
    # Send emails in parallel
    tasks = [
        send_quote_confirmation_email(customer_email, customer_name, tracking_code),
        send_admin_notification_email(admin_email, tracking_code, customer_name, device_type, issue)
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Log results
    success_count = sum(1 for result in results if result is True)
    print(f"Email sending completed: {success_count}/2 emails sent successfully")
    
    return success_count > 0
