# Network Access Configuration Guide

## ✅ Backend Configuration Complete

The backend has been configured to accept connections from your private network.

### Changes Made:
1. ✅ Added `server.address=0.0.0.0` to `application.properties`
   - This allows the backend to accept connections from all network interfaces
   - Previously only accessible via `localhost`

## 🔧 How to Access from Network

### Step 1: Get Your Local IP Address

Run the provided script:
```powershell
.\GET_LOCAL_IP.ps1
```

Or manually:
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }
```

### Step 2: Configure Windows Firewall

**Option A: Use the provided script**
```powershell
.\ALLOW_PORT_8082_FIREWALL.ps1
```

**Option B: Manual Configuration**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `8082`
6. Select "Allow the connection"
7. Apply to all profiles (Domain, Private, Public)
8. Name it "Spring Boot Backend Port 8082"

### Step 3: Start the Backend

```powershell
.\mvnw.cmd spring-boot:run
```

Wait for: `Started InternRegisterApplication`

### Step 4: Access from Other Devices

**From the same machine:**
- `http://localhost:8082`

**From other devices on the network:**
- `http://YOUR_IP_ADDRESS:8082`
- Example: `http://192.168.1.100:8082`

## 🌐 Frontend Configuration (If Needed)

If you want the frontend to also be accessible from the network:

### Option 1: Use Host Flag (Recommended)
```powershell
ng serve --host 0.0.0.0 --port 4200
```

This makes the frontend accessible at:
- `http://YOUR_IP_ADDRESS:4200` from other devices
- `http://localhost:4200` from the same machine

### Option 2: Update Frontend API URL

If your frontend is configured to use `localhost:8082`, you may need to update it to use your IP address when accessing from other devices.

**For Angular applications:**
1. Find your `environment.ts` or `environment.prod.ts` file
2. Update the API URL:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://YOUR_IP_ADDRESS:8082/api'
   };
   ```

**Or use environment variable:**
```typescript
export const environment = {
  production: false,
  apiUrl: process.env['API_URL'] || 'http://localhost:8082/api'
};
```

Then set the environment variable when starting:
```powershell
$env:API_URL="http://YOUR_IP_ADDRESS:8082/api"
ng serve
```

## 🔍 Testing Network Access

### From Another Device:

1. **Test Backend Health:**
   ```bash
   curl http://YOUR_IP_ADDRESS:8082/api/auth/health
   ```
   Or open in browser: `http://YOUR_IP_ADDRESS:8082/swagger-ui.html`

2. **Test Frontend (if configured):**
   Open browser: `http://YOUR_IP_ADDRESS:4200`

### Troubleshooting:

**Issue: Cannot connect from other devices**
- ✅ Check Windows Firewall allows port 8082
- ✅ Verify backend is running (`netstat -ano | findstr :8082`)
- ✅ Ensure devices are on the same network
- ✅ Check IP address is correct (run `GET_LOCAL_IP.ps1`)

**Issue: CORS errors**
- ✅ Backend CORS is already configured to allow all origins
- ✅ No changes needed

**Issue: Connection timeout**
- ✅ Check firewall rules
- ✅ Verify backend is bound to `0.0.0.0` (check `application.properties`)
- ✅ Ensure MySQL is accessible (if database is on another machine, update connection string)

## 📝 Quick Reference

**Backend URLs:**
- Local: `http://localhost:8082`
- Network: `http://YOUR_IP:8082`

**Frontend URLs (if configured):**
- Local: `http://localhost:4200`
- Network: `http://YOUR_IP:4200`

**Useful Commands:**
```powershell
# Get IP address
.\GET_LOCAL_IP.ps1

# Allow firewall port
.\ALLOW_PORT_8082_FIREWALL.ps1

# Check if backend is running
netstat -ano | findstr :8082

# Start backend
.\mvnw.cmd spring-boot:run
```

## 🔒 Security Notes

⚠️ **Important:** This configuration makes your backend accessible on your private network. For production:

1. Use a reverse proxy (nginx, Apache)
2. Enable HTTPS/SSL
3. Restrict access to specific IP ranges
4. Use strong authentication
5. Keep Spring Boot and dependencies updated

For development/testing on a private network, the current configuration is acceptable.

