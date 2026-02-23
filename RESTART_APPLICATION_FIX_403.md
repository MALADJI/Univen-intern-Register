# Fix 403 Error - Restart Application

## 🔍 Problem

Still getting `403 Forbidden` error because:
1. **Application was not restarted** after security configuration changes
2. The old security configuration is still active

## ✅ Solution: Restart Application

The `SecurityHeadersConfig` changes require a **full restart** to take effect.

### Step 1: Stop Current Application

If the application is running:
- Press `Ctrl+C` in the terminal where it's running
- Or kill the process:
  ```powershell
  $process = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
  if ($process) { Stop-Process -Id $process -Force }
  ```

### Step 2: Set Environment Variables

```powershell
$env:MAIL_USERNAME = "Kulani.baloyi@univen.ac.za"
$env:MAIL_PASSWORD = "Kuli@982807@ac@za"
```

### Step 3: Start Application

```powershell
mvn spring-boot:run
```

### Step 4: Wait for Startup

Look for these messages:
```
Started InternRegisterApplication
```

**DO NOT** try to login until you see "Started InternRegisterApplication"

### Step 5: Test Login

1. Open frontend in browser
2. Try to login
3. Should now work without 403 error

## 🔍 Verify Application is Running

Check if application is on port 8082:
```powershell
Get-NetTCPConnection -LocalPort 8082
```

If you see output, the application is running.

## ⚠️ Important Notes

1. **Keep the PowerShell window open** - Environment variables are session-specific
2. **Wait for full startup** - Can take 15-30 seconds
3. **Check console for errors** - If you see errors, share them

## 🐛 If Still Getting 403 After Restart

1. **Check SecurityConfig** - Verify `/api/auth/**` is in `permitAll()`
2. **Check SecurityHeadersConfig** - Verify OPTIONS requests are skipped
3. **Check CORS** - Verify CORS is configured correctly
4. **Check browser console** - Look for CORS errors

---

**After restarting, the 403 error should be resolved!** 🎉

