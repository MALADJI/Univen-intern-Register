# Fix supervisor@univen.ac.za Password Issue

## 🔍 Problem

The user `supervisor@univen.ac.za` exists in database but login returns 401 Unauthorized.

**Most likely cause:** Password hash mismatch - password in database doesn't match what you're entering.

## ✅ Solution: Reset Password

I've added a new admin endpoint to reset user passwords. Here's how to fix it:

### Step 1: Login as Admin First

You need to be logged in as ADMIN to reset passwords:

1. Login with admin account:
   - Email: `admin@univen.ac.za`
   - Password: `admin123`

2. Copy the token from the login response

### Step 2: Reset Supervisor Password

**In browser console (F12), run:**

```javascript
const adminToken = localStorage.getItem('authToken'); // Your admin token

fetch('http://localhost:8082/api/admins/reset-user-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + adminToken
  },
  body: JSON.stringify({
    email: 'supervisor@univen.ac.za',
    newPassword: 'supervisor123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Password reset:', data);
  console.log('Now try logging in with supervisor@univen.ac.za / supervisor123');
})
.catch(e => console.error('❌ Error:', e));
```

### Step 3: Login as Supervisor

After resetting, login with:
- Email: `supervisor@univen.ac.za`
- Password: `supervisor123`

## 🔍 Alternative: Check Backend Logs

When you try to login, check your backend console. You should see:

```
=== LOGIN ATTEMPT ===
Username: supervisor@univen.ac.za
✓ User found: supervisor@univen.ac.za (Role: SUPERVISOR, Email: supervisor@univen.ac.za)
Password valid: false  ← This tells us password doesn't match
```

**If you see "Password valid: false":**
- The password hash in database doesn't match
- Use the reset password endpoint above

## 🧪 Quick Test

After resetting password, test login:

```javascript
fetch('http://localhost:8082/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'supervisor@univen.ac.za',
    password: 'supervisor123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Login successful:', data);
  console.log('Token:', data.token);
})
.catch(e => console.error('❌ Error:', e));
```

## 📋 What to Check

1. **Backend logs** - What does "Password valid:" show?
2. **Database password** - Is it hashed (starts with $2a$)?
3. **Password you're using** - Is it exactly "supervisor123"?

---

**After resetting, the password will be properly hashed and login should work!**

