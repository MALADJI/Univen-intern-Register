# JWT Token Authentication Fix Instructions

## Problem
The JWT token is not being validated correctly, causing 401 Unauthorized errors.

## Solution: Clear Browser Storage and Re-login

### Step 1: Clear Browser Storage
1. Open your browser's Developer Tools (F12)
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Local Storage** → `http://localhost:4200` (or your frontend URL)
4. Click **Clear All** or delete the following keys:
   - `authToken`
   - `currentUser`
5. Close Developer Tools

### Step 2: Re-login
1. Refresh the page
2. Login again with your credentials
3. This will generate a new JWT token with the correct secret key

## Why This Happens
- Old tokens were created with a different secret key
- Tokens may have expired
- Token format may be corrupted in storage

## Verify It's Working
After re-login, check the backend console logs. You should see:
```
✓ JWT Token validated:
  Username: [your-username]
  Role: [your-role]
  ✓ Authentication set in SecurityContext: true
```

## Alternative: Clear via Browser Console
Run this in your browser console:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

