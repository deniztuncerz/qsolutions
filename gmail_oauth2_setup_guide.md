# Gmail OAuth2 Setup Guide

## 1. Google Cloud Console Setup

### Step 1: Create Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API

### Step 2: Create OAuth2 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Desktop application"**
4. Download the JSON file and rename it to `gmail_credentials.json`

### Step 3: Place Credentials
1. Put `gmail_credentials.json` in your project root
2. Run the OAuth2 setup script

## 2. OAuth2 Setup Script

```bash
python gmail_oauth2_setup.py
```

This will:
- Open browser for Gmail authentication
- Save tokens to `gmail_token.pickle`
- Test email sending

## 3. Update main.py

Replace the email service import:

```python
# Change this line in main.py
from gmail_simple_service import send_emails_simple_async, send_status_update_email_simple

# To this
from gmail_oauth_service import send_emails_oauth_async, send_status_update_email_oauth
```

## 4. Test

1. Start the server: `python main.py`
2. Submit a test quote
3. Check if emails are sent successfully

## Troubleshooting

### Error: "Client secrets must be for a web or installed app"
- Make sure you selected "Desktop application" when creating OAuth2 credentials
- Check that the JSON file is properly formatted

### Error: "Access blocked"
- Make sure Gmail API is enabled in Google Cloud Console
- Check that the OAuth consent screen is configured

### Error: "Invalid credentials"
- Delete `gmail_token.pickle` and run setup again
- Make sure you're using the correct Gmail account
