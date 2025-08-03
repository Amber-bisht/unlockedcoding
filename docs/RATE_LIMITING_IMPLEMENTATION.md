# Rate Limiting Implementation

This document outlines the comprehensive rate limiting system implemented across the UnlockedCoding application to prevent API abuse and ensure fair usage.

## Overview

The application implements a multi-layered rate limiting system with different strategies for different types of endpoints:

1. **IP-based rate limiting** for public endpoints (login, contact form)
2. **User-based rate limiting** for authenticated endpoints (copyright, comments, reviews)
3. **Nginx-level rate limiting** for additional protection

## Rate Limiting Categories

### 1. Authentication Endpoints (IP-based)

**Login/Registration Rate Limiting**
- **Limit**: 10 attempts per day per IP
- **Block Duration**: 24 hours
- **Scope**: Per IP address
- **Endpoints**: `/api/auth/login`, `/api/auth/register`
- **Implementation**: `loginRateLimiter` in `server/utils/rate-limiter.ts`

### 2. Public Form Submissions (IP-based)

**Contact Form Rate Limiting**
- **Limit**: 3 submissions per day per IP
- **Block Duration**: 24 hours
- **Scope**: Per IP address
- **Endpoints**: `/api/contact`
- **Implementation**: `contactRateLimiter` in `server/utils/rate-limiter.ts`

### 3. Authenticated User Actions (User-based)

**Copyright Form Submissions**
- **Limit**: 2 submissions per day per authenticated user
- **Block Duration**: 24 hours
- **Scope**: Per authenticated user
- **Endpoints**: `/api/copyright/submit`
- **Implementation**: `copyrightRateLimiter` in `server/utils/rate-limiter.ts`

**Ticket Checker**
- **Limit**: 5 checks per day per authenticated user
- **Block Duration**: 24 hours
- **Scope**: Per authenticated user
- **Endpoints**: `/api/copyright/user-tickets`
- **Implementation**: `ticketCheckerRateLimiter` in `server/utils/rate-limiter.ts`

**Comment Submissions**
- **Limit**: 10 comments per day per authenticated user
- **Block Duration**: 24 hours
- **Scope**: Per authenticated user
- **Endpoints**: `/api/courses/:id/comments`
- **Implementation**: `commentRateLimiter` in `server/utils/rate-limiter.ts`

**Course Reviews**
- **Limit**: 5 reviews per day per authenticated user
- **Block Duration**: 24 hours
- **Scope**: Per authenticated user
- **Endpoints**: `/api/courses/:courseId/reviews`
- **Implementation**: `reviewRateLimiter` in `server/utils/rate-limiter.ts`

## Implementation Details

### Rate Limiter Classes

#### `RateLimiter` (IP-based)
- Used for public endpoints
- Tracks attempts by IP address
- Stores data in `LoginAttempt` collection
- Suitable for login, registration, and contact forms

#### `UserRateLimiter` (User-based)
- Used for authenticated endpoints
- Tracks attempts by user ID
- Stores data in separate collections per action type
- Suitable for user-specific actions like comments, reviews, copyright submissions

### Middleware

#### `userRateLimit` Middleware
- Applied to authenticated endpoints
- Checks authentication before rate limiting
- Provides rate limit information in response headers
- Adds rate limit info to request object for controllers

#### `resetUserRateLimit` Middleware
- Resets rate limits after successful actions
- Can be applied after successful operations

### Response Headers

Rate-limited endpoints include the following headers:
- `X-RateLimit-Limit`: Maximum attempts allowed
- `X-RateLimit-Remaining`: Remaining attempts
- `X-RateLimit-Reset`: Reset time (ISO string)

### Error Responses

When rate limited, endpoints return:
```json
{
  "message": "Rate limit exceeded. Please try again in X hours and Y minutes.",
  "limited": true,
  "remainingTime": 86400000,
  "remainingAttempts": 0
}
```

## Nginx Configuration

Additional rate limiting at the web server level:

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# API rate limiting
location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ... proxy configuration
}

# Auth rate limiting
location /api/auth/ {
    limit_req zone=login burst=5 nodelay;
    # ... proxy configuration
}
```

## Database Collections

Rate limiting data is stored in the following collections:
- `loginattempts` - IP-based login attempts
- `copyright_rate_limits` - Copyright submission limits
- `ticket_checker_rate_limits` - Ticket checking limits
- `comment_rate_limits` - Comment submission limits
- `review_rate_limits` - Review submission limits

## Monitoring and Logging

All rate limiting events are logged:
- **Info level**: Successful resets and normal operations
- **Warn level**: Rate limit violations and blocks
- **Error level**: System errors in rate limiting

## Future Enhancements

### Potential Additional Rate Limiting

1. **Course Enrollment**
   - Limit: 10 enrollments per day per user
   - Prevents spam enrollment

2. **Profile Updates**
   - Limit: 5 updates per day per user
   - Prevents excessive profile changes

3. **Search Queries**
   - Limit: 50 searches per day per user
   - Prevents search abuse

4. **File Uploads**
   - Limit: 10 uploads per day per user
   - Prevents storage abuse

5. **API Key Generation**
   - Limit: 3 API keys per day per user
   - Prevents API key spam

### Advanced Features

1. **Dynamic Rate Limiting**
   - Adjust limits based on user reputation
   - Premium users get higher limits

2. **Geographic Rate Limiting**
   - Different limits for different regions
   - Prevent geographic abuse patterns

3. **Time-based Rate Limiting**
   - Different limits for peak vs off-peak hours
   - Prevent time-based attacks

4. **Rate Limit Analytics**
   - Dashboard for monitoring rate limit usage
   - Identify abuse patterns

## Security Considerations

1. **Rate limit bypass prevention**
   - Multiple detection methods (IP, user ID, session)
   - Consistent enforcement across all endpoints

2. **Graceful degradation**
   - Rate limiting failures don't break the application
   - Fallback to allow requests if rate limiting fails

3. **Privacy protection**
   - Rate limit data is automatically cleaned up
   - No sensitive user data stored in rate limit records

4. **Monitoring and alerting**
   - Log all rate limit violations
   - Alert on unusual patterns

## Testing Rate Limits

To test rate limiting:

1. **Login Rate Limiting**:
   ```bash
   # Make 10 failed login attempts
   for i in {1..11}; do
     curl -X POST http://localhost:5000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"username":"test","password":"wrong"}'
   done
   ```

2. **Copyright Rate Limiting**:
   ```bash
   # Login first, then make copyright submissions
   curl -X POST http://localhost:5000/api/copyright/submit \
     -H "Content-Type: application/json" \
     -H "Cookie: session=your-session-cookie" \
     -d '{"name":"Test","email":"test@example.com","reason":"copyright_infringement","disputeLink":"https://example.com","message":"Test"}'
   ```

3. **Comment Rate Limiting**:
   ```bash
   # Make multiple comment submissions
   curl -X POST http://localhost:5000/api/courses/course-id/comments \
     -H "Content-Type: application/json" \
     -H "Cookie: session=your-session-cookie" \
     -d '{"content":"Test comment"}'
   ```

## Configuration

Rate limiting can be configured by modifying the rate limiter instances in `server/utils/rate-limiter.ts`:

```typescript
// Example: Increase comment limit to 20 per day
export const commentRateLimiter = new UserRateLimiter({
  maxAttempts: 20, // Changed from 10
  windowMs: 24 * 60 * 60 * 1000,
  blockDurationMs: 24 * 60 * 60 * 1000
}, 'comment_rate_limits');
```

## Maintenance

### Cleanup Scripts

The system includes automatic cleanup:
- Old rate limit records are automatically cleaned up
- Login attempts older than 30 days are removed
- User rate limit records are cleaned up daily

### Monitoring

Monitor rate limiting effectiveness:
- Check logs for rate limit violations
- Monitor database size of rate limit collections
- Track user complaints about rate limiting
- Adjust limits based on legitimate usage patterns 