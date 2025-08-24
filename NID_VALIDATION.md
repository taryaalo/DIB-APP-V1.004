# NID Validation API

This document describes how to use the NID (National ID) validation API.

## Environment Variables

The following environment variables must be set in your `.env` file:

```
# SSO Configuration
SSO_URL=https://sso.ndb.gov.ly/connect/token
SSO_CLIENT_ID=clientid-NDB
SSO_CLIENT_SECRET=clientsecret-NDB
SSO_SCOPE=nid phone

# NID Configuration
NID_API_URL=https://nid.ndb.gov.ly
```

## API Endpoints

### POST /api/nid/validate

This endpoint validates a National ID.

**Request Body:**

```json
{
  "nid": "119830000000"
}
```

**Response:**

The response from this endpoint is the direct response from the NID validation API.

### GET /api/nid/state

This endpoint checks the state of the NID service.

**Response:**

The response from this endpoint is the direct response from the NID state API.

### POST /api/nid/phone/match

This endpoint checks if a phone number is matching with a National ID.

**Request Body:**

```json
{
  "nid": "119000000000",
  "phone": "920000000"
}
```

**Response:**

```json
{
  "isMatching": true
}
```
