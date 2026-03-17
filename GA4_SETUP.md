# GA4 Real Time API Setup

## Overview

The dashboard fetches live visitor data from Google Analytics 4 using the Data API v1beta `runRealtimeReport` method. This shows active users, top pages, traffic sources, devices, and geographic data in real time.

## Prerequisites

1. A GA4 property with data collection active
2. OAuth2 credentials (Desktop app type) with the Analytics API enabled
3. A refresh token for the Google account that has access to the GA4 property

## Configuration

### AIB Property (default)

Place a file named `ga4-aib-adc.json` in the `content-dashboard/` root with this structure:

```json
{
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "YOUR_REFRESH_TOKEN",
  "type": "authorized_user"
}
```

### AI Universa Property

Uses the system default Application Default Credentials at:
`~/.config/gcloud/application_default_credentials.json`

Or place a similar JSON file and update the auth logic.

## Property IDs

| Property | GA4 ID | Query Param |
|----------|--------|-------------|
| AI Influencer Blueprint | 503840321 | `?property=aib` |
| AI Universa | 527926974 | `?property=aiuniversa` |

## API Endpoint

```
GET /api/analytics/realtime?property=aib
```

Returns:
```json
{
  "success": true,
  "data": {
    "activeUsers": 5,
    "topPages": [{ "page": "/", "activeUsers": 3 }],
    "sources": [{ "source": "google", "activeUsers": 2 }],
    "devices": [{ "category": "mobile", "activeUsers": 3 }],
    "countries": [{ "country": "United States", "activeUsers": 2 }]
  },
  "cached": false,
  "lastUpdated": "2026-03-16T21:30:00.000Z"
}
```

## Rate Limits

The API route includes a 30 second server side cache to avoid hitting GA4 rate limits. The frontend also polls every 30 seconds, so in practice each property gets at most 2 API calls per minute.

## Generating Credentials

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create an OAuth 2.0 Client ID (Desktop app type)
3. Enable the "Google Analytics Data API" in the API Library
4. Use `gcloud auth application-default login --scopes=https://www.googleapis.com/auth/analytics.readonly` or run the OAuth flow manually to get a refresh token
5. Save the credentials JSON in the format shown above

## Troubleshooting

If the widget shows "Connect GA4":
  The credentials file is missing or unreadable

If the widget shows an error:
  Check that the GA4 property ID is correct and the authenticated user has Viewer access or higher

If data appears stale:
  The 30s cache may be serving old data. Wait for the next refresh cycle.
