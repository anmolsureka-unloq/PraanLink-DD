"""
Google Calendar API integration utilities for creating appointment events.
Reuses the same OAuth2 token as Gmail (token.json is scoped for both
gmail.send and calendar, see utils/gmail_integration.py).
"""
import os
from typing import List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from googleapiclient.discovery import build
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow
    CALENDAR_AVAILABLE = True
except ImportError:
    CALENDAR_AVAILABLE = False
    logger.warning("Google API client libraries not installed. Install with: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")


SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar'
]


def get_calendar_service():
    """
    Get authenticated Google Calendar service instance.
    Shares the same token.json/credentials.json as Gmail integration.
    """
    if not CALENDAR_AVAILABLE:
        raise ImportError("Google API client libraries not installed")

    creds = None
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    token_path = os.path.join(backend_dir, "token.json")
    credentials_path = os.path.join(backend_dir, "credentials.json")

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(credentials_path):
                raise FileNotFoundError(
                    f"Credentials file not found at {credentials_path}. "
                    "Please set up OAuth2 credentials from Google Cloud Console."
                )
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    return build('calendar', 'v3', credentials=creds)


def create_calendar_event(
    title: str,
    description: str = "",
    start_time: str = "",
    end_time: str = "",
    location: str = "",
    attendees: Optional[List[str]] = None,
    calendar_id: str = "primary"
) -> dict:
    """
    Create an event on Google Calendar.

    Args:
        title: Event title/summary
        description: Event description
        start_time: ISO 8601 datetime string (e.g. "2025-01-15T10:00:00")
        end_time: ISO 8601 datetime string
        location: Event location
        attendees: List of attendee email addresses
        calendar_id: Calendar to create the event on (default: primary)

    Returns:
        Dictionary with success status and event details
    """
    try:
        if not CALENDAR_AVAILABLE:
            return {
                "success": False,
                "error": "Google Calendar API libraries not installed. Install with: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib"
            }

        if not start_time or not end_time:
            return {
                "success": False,
                "error": "start_time and end_time are required"
            }

        service = get_calendar_service()

        event_body = {
            "summary": title,
            "description": description,
            "location": location,
            "start": {"dateTime": start_time},
            "end": {"dateTime": end_time},
        }
        if attendees:
            event_body["attendees"] = [{"email": email} for email in attendees]

        created_event = service.events().insert(
            calendarId=calendar_id,
            body=event_body,
            sendUpdates="all" if attendees else "none"
        ).execute()

        logger.info(f"Calendar event created: {created_event.get('id')}")

        return {
            "success": True,
            "event_id": created_event.get("id"),
            "event_link": created_event.get("htmlLink"),
            "title": title,
            "start_time": start_time,
            "end_time": end_time
        }

    except Exception as e:
        logger.error(f"Error creating calendar event: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
