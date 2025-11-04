# 🔧 Quick Fix: Clear Storage and Login Again

## 🎯 The Problem

You're getting **401 Unauthorized** errors because:
1. **Old tokens are invalid** - We fixed the JWT secret key, so all tokens created before the fix are now invalid
2. **Browser still has old token** - Your browser is using an old, invalid token

## ✅ The Solution (3 Steps)

### Step 1: Clear Browser Storage

**Open Browser Console (Press F12) and run:**

```javascript
// Clear all stored data
localStorage.clear();
sessionStorage.clear();

// Verify it's cleared
console.log('Storage cleared!');
console.log('localStorage:', localStorage.length, 'items');
console.log('sessionStorage:', sessionStorage.length, 'items');
```

### Step 2: Refresh the Page

Press `F5` or `Ctrl+R` to refresh the page.

### Step 3: Login Again

1. Go to the login page
2. Enter your credentials
3. Click **Login**
4. You should get a **new, valid token**

## 🧪 Verify It's Working

After login, check in Browser Console:

```javascript
// Check if token is stored
const token = localStorage.getItem('token');
console.log('Token stored:', !!token);
if (token) {
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
}
```

Then check the **Network** tab:
1. Open DevTools (F12)
2. Go to **Network** tab
3. Make a request (e.g., go to dashboard)
4. Click on a request (e.g., `/api/interns`)
5. Check **Headers** → **Request Headers**
6. Look for: `Authorization: Bearer <token>`

If you see the Authorization header, **it's working!** ✅

## 🚨 Still Getting 401?

### Check 1: Is Backend Running?

```powershell
netstat -ano | findstr :8082
```

Should show `LISTENING` on port 8082.

### Check 2: Is Token Being Sent?

In **Network** tab:
- Open a failed request (401 error)
- Check **Headers** → **Request Headers**
- Is `Authorization: Bearer ...` present?

**If NO Authorization header:**
- Frontend is not sending the token
- Check frontend HTTP interceptor/service
- See `TOKEN_401_FIX.md` for details

**If Authorization header is present but still 401:**
- Token might be invalid/expired
- Clear storage and login again
- Check backend logs for error details

### Check 3: Backend Logs

Check backend console for:
```
✗ JWT Token validation failed:
  Reason: Invalid or expired token
```

OR

```
✓ JWT Authentication successful:
  Username: your-email@univen.ac.za
  Role: INTERN
```

## 📋 Quick Checklist

- [ ] Cleared browser storage (`localStorage.clear()`)
- [ ] Refreshed the page
- [ ] Logged in again
- [ ] Token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Backend running on port 8082
- [ ] No more 401 errors

## 🎯 Expected Result

After clearing storage and logging in:
- ✅ Login successful
- ✅ Token stored in localStorage
- ✅ API requests include `Authorization: Bearer <token>`
- ✅ Backend logs show "JWT Authentication successful"
- ✅ API requests return 200 OK (not 401)

---

**The main issue is old tokens are invalid. Clear storage and login again to get a new valid token!**

