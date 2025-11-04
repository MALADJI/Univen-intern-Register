# Frontend Connection Guide

## ✅ Backend is Ready!

**Backend URL**: `http://localhost:8082`  
**API Base URL**: `http://localhost:8082/api`  
**Status**: ✅ Running and responding

---

## Frontend Configuration

### 1. Update Your Angular API Service

Make sure your Angular service points to the correct backend URL:

```typescript
// In your api.service.ts or similar file
export class ApiService {
  private baseUrl = 'http://localhost:8082/api';  // ← Make sure this matches
  
  constructor(private http: HttpClient) {}
}
```

### 2. CORS Configuration ✅

The backend is **already configured** to allow requests from your frontend:
- ✅ All origins allowed (`*`)
- ✅ All methods allowed (GET, POST, PUT, DELETE, OPTIONS)
- ✅ All headers allowed
- ✅ Ready for `http://localhost:4200` (Angular default port)

**No CORS errors should occur!**

---

## Testing Flow

### Step 1: Test Login from Frontend

1. **Open your Angular app**: `http://localhost:4200`
2. **Navigate to login page**
3. **Enter credentials** and click login

**Expected Behavior**:
- Frontend sends POST to `http://localhost:8082/api/auth/login`
- Backend validates credentials
- Returns JWT token on success
- Frontend stores token and navigates to dashboard

### Step 2: Test with Browser Console

Open browser DevTools (F12) → Network tab to see requests:

```
POST http://localhost:8082/api/auth/login
Status: 200 OK
Response: { "token": "...", "role": "ADMIN", ... }
```

### Step 3: Test Protected Endpoints

After login, test protected endpoints:
- Get interns: `GET http://localhost:8082/api/interns`
- Get leave requests: `GET http://localhost:8082/api/leave`
- Generate reports: `GET http://localhost:8082/api/reports/attendance/pdf`

---

## Common Issues & Solutions

### Issue 1: CORS Error
**Symptoms**: Browser console shows CORS error

**Solution**: ✅ Already fixed - CORS is configured in `SecurityConfig.java`

### Issue 2: 401 Unauthorized
**Symptoms**: Protected endpoints return 401

**Solution**: 
- Make sure you're sending the JWT token in headers:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Issue 3: 429 Too Many Requests
**Symptoms**: Login fails after multiple attempts

**Solution**: 
- This is rate limiting (security feature)
- Wait 15 minutes or restart backend to clear
- Or modify `RateLimitingService.java` for testing

### Issue 4: Connection Refused
**Symptoms**: Cannot connect to backend

**Solution**:
- ✅ Check backend is running: `netstat -ano | findstr :8082`
- ✅ Verify backend URL in frontend matches: `http://localhost:8082/api`
- ✅ Check firewall isn't blocking port 8082

---

## Quick Test Checklist

Use this checklist to verify frontend-backend connection:

### ✅ Pre-Testing
- [ ] Backend is running on port 8082
- [ ] Angular app is running on port 4200 (or your port)
- [ ] Database is connected (MySQL)

### ✅ Authentication
- [ ] Can send verification code
- [ ] Can verify code
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Token is stored in localStorage

### ✅ Protected Endpoints
- [ ] Can fetch interns (with token)
- [ ] Can fetch attendance records (with token)
- [ ] Can fetch leave requests (with token)
- [ ] Can generate reports (with token)

### ✅ Error Handling
- [ ] Shows error on wrong credentials
- [ ] Shows error on rate limiting
- [ ] Shows error on missing token
- [ ] Handles network errors gracefully

---

## Example Frontend API Calls

### Login Example
```typescript
login(username: string, password: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/auth/login`, {
    username,
    password
  }).pipe(
    tap(response => {
      // Store token
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
    })
  );
}
```

### Authenticated Request Example
```typescript
getAllInterns(): Observable<any[]> {
  const token = localStorage.getItem('token');
  return this.http.get<any[]>(`${this.baseUrl}/interns`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}
```

### Report Download Example
```typescript
downloadReportPDF(): void {
  const token = localStorage.getItem('token');
  this.http.get(`${this.baseUrl}/reports/attendance/pdf`, {
    headers: { 'Authorization': `Bearer ${token}` },
    responseType: 'blob'
  }).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance-report.pdf';
    link.click();
  });
}
```

---

## Testing from Browser

### Option 1: Direct Browser Test
1. Open browser DevTools (F12)
2. Go to Console tab
3. Test API directly:
```javascript
// Test login
fetch('http://localhost:8082/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'test@univen.ac.za',
    password: 'Test123!'
  })
}).then(r => r.json()).then(console.log);
```

### Option 2: Use Swagger UI
1. Visit: `http://localhost:8082/swagger-ui/index.html`
2. Click "Authorize" button
3. Enter token: `Bearer YOUR_TOKEN`
4. Test endpoints interactively

---

## Network Debugging

### Check Request/Response in Browser:
1. Open DevTools (F12)
2. Go to **Network** tab
3. Make a request from your frontend
4. Click on the request to see:
   - **Request URL**: Should be `http://localhost:8082/api/...`
   - **Request Headers**: Should include `Authorization: Bearer ...`
   - **Response Status**: Should be `200 OK` for success
   - **Response Body**: Should contain data

### Common Network Issues:
- **404 Not Found**: Wrong URL or endpoint doesn't exist
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Token doesn't have required role
- **500 Internal Server Error**: Backend error (check backend logs)
- **CORS Error**: Already fixed, shouldn't occur

---

## Expected Frontend Flow

### 1. Registration Flow
```
Frontend → POST /api/auth/send-verification-code
         → POST /api/auth/register
         → Auto-creates profile (ADMIN/SUPERVISOR/INTERN)
         → Returns user ID and role
```

### 2. Login Flow
```
Frontend → POST /api/auth/login
         → Backend validates credentials
         → Returns JWT token + role + username
         → Frontend stores token
         → Navigate to role-specific dashboard
```

### 3. Dashboard Flow
```
Frontend → GET /api/auth/me (verify token)
         → GET /api/interns (if admin/supervisor)
         → GET /api/leave (if admin/supervisor)
         → GET /api/attendance (if supervisor/intern)
```

---

## Backend Status Verification

To verify backend is ready:

```powershell
# Check if backend is running
netstat -ano | findstr :8082

# Should show:
# TCP    0.0.0.0:8082           0.0.0.0:0              LISTENING

# Test API endpoint
Invoke-WebRequest -Uri http://localhost:8082/api/auth/send-verification-code `
  -Method POST -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@test.com"}' -UseBasicParsing
```

---

## Ready to Test!

✅ **Backend**: Running on port 8082  
✅ **CORS**: Configured to allow frontend  
✅ **API**: All endpoints working  
✅ **Security**: Authentication & authorization active  

**Your frontend can now connect and test all features!**

---

## Need Help?

1. **Check browser console** for errors
2. **Check network tab** for failed requests
3. **Check backend logs** for server errors
4. **Use Swagger UI** to test endpoints: `http://localhost:8082/swagger-ui/index.html`
5. **Review API_DOCUMENTATION.md** for endpoint details

---

**Status**: ✅ **READY FOR FRONTEND TESTING**

