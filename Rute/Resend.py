from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import resend

router = APIRouter(tags=["Resend"])

resend.api_key = os.environ["RESEND_API_KEY"]

# Definește un model Pydantic pentru corpul cererii
class EmailRequest(BaseModel):
    to: list[str]
    subject: str
    html: str
    from_: str = "Acme <onboarding@resend.dev>"

@router.post("/send_email")
async def send_email(email_request: EmailRequest):
    # Construiește parametrul pentru trimiterea e-mailului
    params = {
        "from": email_request.from_,
        "to": email_request.to,
        "subject": email_request.subject,
        "html": email_request.html,
    }

    try:
        # Trimite e-mailul folosind Resend
        email = resend.Emails.send(params)
        # Returnează rezultatul înapoi la client
        return {"status": "success", "email": email}
    except Exception as e:
        # Prinde orice eroare și returnează mesajul de eroare
        raise HTTPException(status_code=500, detail=str(e))

