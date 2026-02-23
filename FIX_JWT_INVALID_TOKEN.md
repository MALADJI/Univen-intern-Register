# Fix: JWT Invalid Token Error

## 🔍 Problem

The JWT filter was reporting "Invalid token for /api/leave" even though the token was valid. This was happening because:

1. **Secret Key Regeneration**: The `JwtTokenProvider` was generating a new random secret key every time the application restarted
2. **Token Invalidation**: When the secret key changes, all existing tokens become invalid because they were signed with the old key
3. **No Error Details**: The validation method wasn't logging what specific error occurred

## ✅ Root Cause

The original code used:
```java
private final Key secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
```

This generates a **new random key** every time the application starts, making all previously issued tokens invalid.

## 🔧 Fixes Applied

### 1. **Persistent Secret Key**
- Changed to use a fixed secret key from `application.properties` or environment variable
- Falls back to a default development secret if not configured
- Ensures tokens remain valid across application restarts

### 2. **Enhanced Error Logging**
- Added detailed exception handling in `validateToken()` method
- Now logs specific error types:
  - Expired tokens
  - Invalid signatures (usually means secret key changed)
  - Malformed tokens
  - Unsupported tokens
  - Empty/null tokens

### 3. **Configuration Support**
- Added `jwt.secret` property to `application.properties`
- Supports environment variable `JWT_SECRET`
- Supports base64-encoded keys or plain text strings

## 📋 Changes Made

### `JwtTokenProvider.java`:
1. **Constructor-based secret key initialization**:
   - Reads from `jwt.secret` property or `JWT_SECRET` environment variable
   - Falls back to default development secret if not configured
   - Handles both base64-encoded and plain text secrets

2. **Enhanced `validateToken()` method**:
   - Catches specific exception types
   - Logs detailed error messages
   - Helps diagnose token validation failures

### `application.properties`:
- Added `jwt.secret` property with default development value
- Added documentation on how to configure it

## 🎯 Expected Behavior

### After Restart:

1. **On Application Start**:
   ```
   ✓ JWT: Using secret key from configuration
   ```
   OR if using default:
   ```
   ⚠️ JWT: Using default secret key (development only). Set jwt.secret in application.properties or environment variable for production!
   ```

2. **When Token Validation Fails**:
   - You'll now see specific error messages like:
     ```
     ❌ JWT Token signature invalid: ...
        This usually means the secret key changed (app was restarted) or token was tampered with
     ```
   OR
     ```
     ❌ JWT Token expired: ...
     ```

3. **Tokens Remain Valid**: Tokens issued before restart will now remain valid after restart (as long as they haven't expired)

## 🔍 Verification Steps

1. **Restart Spring Boot application**

2. **Check server console** for JWT initialization message:
   ```
   ✓ JWT: Using secret key from configuration
   ```

3. **Try logging in again** - the new token should work

4. **Check server logs** if token validation fails - you'll see detailed error messages

## ⚠️ Important Notes

### For Development:
- The default secret key in `application.properties` is fine for development
- All tokens will remain valid across restarts

### For Production:
1. **Generate a strong secret key**:
   ```bash
   # Linux/Mac
   openssl rand -base64 32
   
   # Or use an online generator
   ```

2. **Set it in application.properties**:
   ```properties
   jwt.secret=your-generated-secret-key-here-at-least-32-characters
   ```

3. **OR use environment variable** (more secure):
   ```bash
   # Linux/Mac
   export JWT_SECRET="your-generated-secret-key-here"
   
   # Windows PowerShell
   $env:JWT_SECRET="your-generated-secret-key-here"
   ```

4. **Keep it secret**: Never commit the production secret key to version control

## 🔄 If Tokens Still Invalid

1. **Check server logs** for specific error message:
   - Expired? User needs to log in again
   - Signature invalid? Secret key might have changed - check configuration
   - Malformed? Token might be corrupted

2. **Verify secret key is consistent**:
   - Check `application.properties` has `jwt.secret` set
   - Check environment variable `JWT_SECRET` if using it
   - Make sure it's the same value that was used when tokens were issued

3. **Check token expiration**:
   - Default token validity is 1 day (86400000 ms)
   - If token is older than 1 day, user needs to log in again

4. **Clear browser storage and log in again**:
   - Old tokens might be cached in browser
   - Clear localStorage/sessionStorage and log in fresh

## 📝 Token Lifecycle

1. **User logs in** → Token issued with current secret key
2. **Application restarts** → Uses same secret key (from config)
3. **Token validation** → Validates against same secret key ✅
4. **Token expires** → User needs to log in again (after 1 day by default)

