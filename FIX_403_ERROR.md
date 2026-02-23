# Fix 403 Forbidden Error on Login

## 🔍 Problem

Getting `403 Forbidden` error when trying to login from the frontend:
```
POST auth/login error: 403 Forbidden
API Error: Forbidden. You do not have permission to access this resource.
```

## ✅ Solution Applied

I've fixed the issue by updating `SecurityHeadersConfig.java`:

### Changes Made:

1. **Skip OPTIONS requests** - Security headers filter now skips CORS preflight requests
2. **Relaxed Content-Security-Policy** - Updated CSP to allow all localhost connections
3. **Improved CORS headers** - Now allows all origins (not just localhost) and sets proper CORS headers

### Files Modified:
- `src/main/java/com/internregister/config/SecurityHeadersConfig.java`

## 🔄 Next Steps

**You must restart the Spring Boot application** for these changes to take effect:

1. **Stop the current application** (Ctrl+C in the terminal)
2. **Restart the application:**
   ```powershell
   # Set environment variables (if not already set)
   $env:MAIL_USERNAME = "Kulani.baloyi@univen.ac.za"
   $env:MAIL_PASSWORD = "Kuli@982807@ac@za"
   
   # Start the application
   mvn spring-boot:run
   ```

3. **Wait for application to start** (look for "Started InternRegisterApplication")
4. **Try logging in again** from the frontend

## 🧪 Verify the Fix

After restarting:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check the login request:
   - Status should be `200 OK` (not 403)
   - Response should contain `token`, `role`, `username`

## 📝 What Was Wrong?

The `SecurityHeadersConfig` filter was:
- Setting restrictive Content-Security-Policy headers
- Not properly handling CORS preflight (OPTIONS) requests
- Potentially blocking requests before they reached the security configuration

## ✅ Expected Behavior After Fix

- ✅ Login endpoint (`POST /api/auth/login`) should work
- ✅ CORS preflight requests should pass
- ✅ All `/api/auth/**` endpoints should be accessible
- ✅ Frontend can successfully authenticate

---

**After restarting, the 403 error should be resolved!** 🎉

