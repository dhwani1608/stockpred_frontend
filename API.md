# API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-02-01T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /api/auth/login
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-02-01T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /api/auth/me
Get current user info.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-02-01T10:00:00Z"
  }
}
```

## Watchlist Endpoints

### GET /api/watchlist
Get user's watchlist.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "clxxx...",
    "userId": "clxxx...",
    "symbol": "AAPL",
    "createdAt": "2025-02-01T10:00:00Z"
  }
]
```

### POST /api/watchlist
Add symbol to watchlist.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "symbol": "AAPL"
}
```

**Response:**
```json
{
  "id": "clxxx...",
  "userId": "clxxx...",
  "symbol": "AAPL",
  "createdAt": "2025-02-01T10:00:00Z"
}
```

### DELETE /api/watchlist?symbol=AAPL
Remove symbol from watchlist.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true
}
```

## Prediction Endpoints

### GET /api/predictions
Get prediction history.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `symbol` (optional): Filter by stock symbol
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
[
  {
    "id": "clxxx...",
    "userId": "clxxx...",
    "symbol": "AAPL",
    "prediction": "UP",
    "confidence": 0.67,
    "signal": "BUY",
    "date": "2025-02-01T10:00:00Z",
    "createdAt": "2025-02-01T10:00:00Z"
  }
]
```

### POST /api/predictions
Save a prediction.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "symbol": "AAPL",
  "prediction": "UP",
  "confidence": 0.67,
  "signal": "BUY"
}
```

**Response:**
```json
{
  "id": "clxxx...",
  "userId": "clxxx...",
  "symbol": "AAPL",
  "prediction": "UP",
  "confidence": 0.67,
  "signal": "BUY",
  "date": "2025-02-01T10:00:00Z",
  "createdAt": "2025-02-01T10:00:00Z"
}
```

## Backend Integration

These endpoints proxy to the FastAPI backend:

### POST {NEXT_PUBLIC_API_URL}/predict/
Get single stock prediction.

**Request:**
```json
{
  "symbol": "AAPL"
}
```

**Response:**
```json
{
  "symbol": "AAPL",
  "direction": "UP",
  "confidence": 0.67,
  "signal": "BUY",
  "timestamp": "2025-02-01T10:00:00Z"
}
```

### POST {NEXT_PUBLIC_API_URL}/predict/batch
Get multiple stock predictions.

**Request:**
```json
{
  "symbols": ["AAPL", "GOOGL", "TSLA"]
}
```

**Response:**
```json
[
  {
    "symbol": "AAPL",
    "direction": "UP",
    "confidence": 0.67,
    "signal": "BUY",
    "timestamp": "2025-02-01T10:00:00Z"
  },
  {
    "symbol": "GOOGL",
    "direction": "DOWN",
    "confidence": 0.42,
    "signal": "SELL",
    "timestamp": "2025-02-01T10:00:00Z"
  }
]
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Authentication Flow

1. User registers or logs in
2. Receive JWT token
3. Store token in localStorage
4. Include token in Authorization header for protected routes
5. Token expires after 7 days

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production:
- Max 100 predictions per user per day
- Max 10 batch predictions per hour
- Max 50 watchlist items per user
