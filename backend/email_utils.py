import os
import httpx
import logging
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv(override=True)

logger = logging.getLogger(__name__)

EMAIL_API_KEY = os.getenv("EMAIL_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@studentmanagement.com")
EMAIL_API_URL = os.getenv("EMAIL_API_URL", "https://api.brevo.com/v3/smtp/email")

if not EMAIL_API_KEY:
    raise ValueError("EMAIL_API_KEY environment variable is not set. Cannot send emails.")

async def send_email_to_student(email: str, subject: str, body: str, reply_to_email: str = None, sender_name: str = "Student Management"):
    """
    Sends an email using Brevo HTTP API.
    """
    headers = {
        "api-key": EMAIL_API_KEY,
        "accept": "application/json",
        "Content-Type": "application/json"
    }
    
    payload = {
        "sender": {"name": sender_name, "email": EMAIL_FROM},
        "to": [{"email": email}],
        "subject": subject,
        "htmlContent": body
    }
    if reply_to_email:
        payload["replyTo"] = {"email": reply_to_email, "name": sender_name}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(EMAIL_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            return {"status": "success", "message": f"Email sent to {email}"}
        except Exception as e:
            if hasattr(e, "response") and e.response is not None:
                logger.error(f"Error sending email via Brevo API: {e.response.text}")
            else:
                logger.error(f"Error sending email via HTTP API: {e}")
            raise e

def send_custom_smtp_email(email: str, subject: str, body: str, smtp_host: str, smtp_port: int, smtp_username: str, smtp_password: str):
    """
    Sends an email using built-in smtplib and custom user credentials.
    """
    try:
        msg = EmailMessage()
        msg.set_content(body, subtype='html')
        msg['Subject'] = subject
        msg['From'] = smtp_username
        msg['To'] = email
        
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        return {"status": "success", "message": f"Email sent via custom SMTP to {email}"}
    except Exception as e:
        logger.error(f"Error sending email via custom SMTP: {e}")
        raise e
