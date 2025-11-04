# Security Features Documentation

## Overview
This document outlines all security features implemented in the Intern Register System backend.

---

## 1. Authentication & Authorization

### JWT Token-Based Authentication
- **Implementation**: Custom JWT token provider using JJWT library
- **Token Validity**: 24 hours
- **Token Storage**: JWT contains username and role
- **Security**: Tokens are signed with HS256 algorithm using a secure key

### Password Security
- **Hashing**: BCrypt password hashing (10 rounds)
- **Validation**: Strong password requirements enforced
- **Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character (@$!%*?&)

### Role-Based Access Control
- **Roles**: ADMIN, SUPERVISOR, INTERN
- **Implementation**: Roles stored in JWT token and validated on each request
- **Authorization**: Protected endpoints require valid token with appropriate role

---

## 2. Rate Limiting & Account Protection

### Login Rate Limiting
- **Feature**: Prevents brute force attacks
- **Threshold**: 5 failed login attempts
- **Lockout Duration**: 15 minutes
- **Tracking**: Per IP address
- **Auto-Reset**: Lockout expires after 15 minutes
- **Response**: Returns HTTP 429 (Too Many Requests) with remaining lockout time

### IP-Based Tracking
- **Implementation**: In-memory storage (can be upgraded to Redis for distributed systems)
- **Headers Checked**: X-Forwarded-For, X-Real-IP, Remote Address
- **Automatic Clear**: Successful login clears failed attempts

---

## 3. Input Validation

### Email Validation
- **Format Check**: Basic email format validation
- **Required**: Email must be provided
- **Trimmed**: Whitespace is removed automatically

### Password Validation
- **Strength Check**: Validates against security requirements
- **Real-time Feedback**: Returns specific error messages for each validation failure
- **Before Storage**: Validation happens before password hashing

### Role Validation
- **Allowed Values**: ADMIN, SUPERVISOR, INTERN
- **Case Insensitive**: Accepts lowercase or uppercase
- **Error Handling**: Returns clear error message for invalid roles

### Request Body Validation
- **Required Fields**: Validates presence of required fields
- **Type Checking**: Ensures correct data types
- **Trim Values**: Automatically trims string inputs

---

## 4. Security Headers

All HTTP responses include security headers to prevent common attacks:

### Headers Implemented:
1. **X-Content-Type-Options: nosniff**
   - Prevents MIME type sniffing attacks

2. **X-Frame-Options: DENY**
   - Prevents clickjacking attacks
   - Blocks page from being embedded in iframes

3. **X-XSS-Protection: 1; mode=block**
   - Enables XSS filtering in browsers
   - Blocks pages if XSS attack detected

4. **Content-Security-Policy: default-src 'self'**
   - Restricts resource loading to same origin
   - Prevents XSS and data injection attacks

5. **Strict-Transport-Security: max-age=31536000; includeSubDomains**
   - Forces HTTPS connections
   - Valid for 1 year
   - Includes all subdomains

6. **Referrer-Policy: strict-origin-when-cross-origin**
   - Controls referrer information
   - Protects user privacy

---

## 5. CORS Configuration

### Cross-Origin Resource Sharing
- **Allowed Origins**: All origins (*) - Configure for production
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: All headers
- **Credentials**: Not enabled (can be enabled if needed)
- **Note**: For production, restrict to specific frontend domain

---

## 6. Email Verification

### Verification Code System
- **Code Generation**: 6-digit random code
- **Expiration**: 10 minutes
- **Storage**: Database with expiration timestamp
- **One-Time Use**: Code is deleted after successful verification
- **Cleanup**: Scheduled task removes expired codes every hour

---

## 7. Session Management

### Stateless Sessions
- **Implementation**: STATELESS session creation policy
- **Token-Based**: No server-side session storage
- **Stateless**: Each request is independent
- **Scalability**: Enables horizontal scaling

---

## 8. Error Handling

### Secure Error Messages
- **Generic Errors**: Doesn't reveal user existence
- **Login Errors**: "Invalid credentials" for both wrong username and password
- **Rate Limiting**: Clear messages about lockout status
- **Validation Errors**: Specific messages for validation failures

### HTTP Status Codes
- **200 OK**: Successful request
- **400 Bad Request**: Invalid input/validation errors
- **401 Unauthorized**: Authentication required/invalid credentials
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server errors

---

## 9. Profile Creation Security

### Automatic Profile Creation
- **On Registration**: Automatically creates corresponding profile
- **Role-Specific**: Different profiles for ADMIN, SUPERVISOR, INTERN
- **Database Integrity**: Ensures user-profile relationship
- **Validation**: Checks for existing profiles before creation

---

## 10. API Security

### Endpoint Protection
- **Public Endpoints**: Only `/api/auth/**`, Swagger UI, and API docs
- **Protected Endpoints**: All other endpoints require authentication
- **Token Validation**: JWT token validated on every request
- **Role Extraction**: Role extracted from token for authorization

### Request Filtering
- **JWT Filter**: Validates and extracts token from Authorization header
- **Security Context**: Sets authentication in Spring Security context
- **Chain Execution**: Continues filter chain if token valid

---

## 11. Password Requirements

### Strong Password Policy
```
✓ Minimum 8 characters
✓ At least one uppercase letter (A-Z)
✓ At least one lowercase letter (a-z)
✓ At least one digit (0-9)
✓ At least one special character (@$!%*?&)
```

### Example Valid Passwords:
- `Admin123!`
- `Secure@Pass2024`
- `MyP@ssw0rd`
- `Super$ecure123`

### Example Invalid Passwords:
- `password` (no uppercase, digit, or special char)
- `PASSWORD123` (no lowercase or special char)
- `Password` (no digit or special char)
- `Pass123` (too short)

---

## 12. Best Practices Implemented

### Security Best Practices:
1. ✅ Password hashing (BCrypt)
2. ✅ JWT token-based authentication
3. ✅ Rate limiting on login
4. ✅ Input validation
5. ✅ Security headers
6. ✅ CORS configuration
7. ✅ Email verification
8. ✅ Stateless sessions
9. ✅ Secure error messages
10. ✅ Role-based authorization

---

## 13. Testing Security Features

### Test Scenarios:
1. **Rate Limiting**: Try 5+ failed logins from same IP
2. **Password Validation**: Try weak passwords during registration
3. **Token Validation**: Try accessing protected endpoints without token
4. **Email Verification**: Try registering without verification code
5. **Role Validation**: Try registering with invalid role

### Test Using:
- `test-backend-endpoints.http` file
- Postman/Insomnia
- Swagger UI

---

## 14. Production Recommendations

### Before Production Deployment:
1. **CORS**: Restrict to specific frontend domain
2. **Rate Limiting**: Consider Redis for distributed systems
3. **HTTPS**: Ensure HTTPS is enabled
4. **Secret Key**: Store JWT secret in environment variable
5. **Database**: Use connection pooling
6. **Monitoring**: Add logging and monitoring
7. **Backup**: Regular database backups
8. **Audit Logs**: Log security events

### Environment Variables to Set:
```
JWT_SECRET_KEY=<secure-random-key>
DATABASE_URL=<production-db-url>
DATABASE_USERNAME=<db-username>
DATABASE_PASSWORD=<db-password>
CORS_ALLOWED_ORIGINS=<frontend-url>
```

---

## 15. Security Checklist

### Before Deployment:
- [ ] Change default JWT secret key
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure logging for security events
- [ ] Review and restrict rate limiting if needed
- [ ] Set up monitoring and alerts
- [ ] Review password policy requirements
- [ ] Test all security features
- [ ] Document security procedures

---

## Support

For security concerns or questions:
1. Review this documentation
2. Check `API_DOCUMENTATION.md` for API details
3. Review code comments in security classes
4. Use Swagger UI for testing: `http://localhost:8082/swagger-ui/index.html`

