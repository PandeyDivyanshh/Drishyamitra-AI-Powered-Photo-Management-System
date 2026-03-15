"""Communication utilities for email (SMTP) and WhatsApp (Twilio)."""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from pathlib import Path
from typing import Optional

from app.config import (
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM,
)

logger = logging.getLogger(__name__)


def send_email(
    to: str,
    subject: str,
    body: str,
    attachments: Optional[list[str]] = None,
) -> bool:
    """
    Send an email via SMTP with optional file attachments.

    Args:
        to: Recipient email address.
        subject: Email subject line.
        body: Email body text.
        attachments: List of absolute file paths to attach.

    Returns:
        True if sent successfully, False otherwise.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email not sent.")
        return False

    msg = MIMEMultipart()
    msg["From"] = SMTP_USER
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    for filepath in (attachments or []):
        path = Path(filepath)
        if path.exists():
            part = MIMEBase("application", "octet-stream")
            part.set_payload(path.read_bytes())
            encoders.encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f'attachment; filename="{path.name}"',
            )
            msg.attach(part)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("Email sent to %s", to)
        return True
    except Exception as e:
        logger.error("Failed to send email: %s", e)
        return False


def send_whatsapp(
    to: str,
    message: str,
    media_url: Optional[str] = None,
) -> bool:
    """
    Send a WhatsApp message via Twilio.

    This is a PLACEHOLDER implementation that logs the intent.
    Replace with real Twilio SDK calls when credentials are available.

    Args:
        to: Recipient phone number in E.164 format (e.g., +919876543210).
        message: Text message to send.
        media_url: Optional URL of media to attach.

    Returns:
        True if the placeholder succeeded.
    """
    logger.info(
        "[WhatsApp Placeholder] To: %s | Message: %s | Media: %s",
        to, message, media_url,
    )

    # ── Real Twilio implementation (uncomment when ready) ───
    # from twilio.rest import Client
    # if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
    #     logger.warning("Twilio credentials not configured.")
    #     return False
    # client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    # kwargs = {
    #     "from_": TWILIO_WHATSAPP_FROM,
    #     "to": f"whatsapp:{to}",
    #     "body": message,
    # }
    # if media_url:
    #     kwargs["media_url"] = [media_url]
    # msg = client.messages.create(**kwargs)
    # logger.info("WhatsApp message sent: SID %s", msg.sid)
    # return True

    return True
