# Token Expired - Quick Fix Guide

## ❌ Error: "Invalid or expired token"

This means your JWT token has **expired** or is **invalid**.

**JWT tokens expire after 24 hours** for security reasons.

---

## ✅ Solution: Get a New Token

### **Step 1: Login Again**

```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "supervisor.test@univen.ac.za",
  "password": "Supervisor123!"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcnZpc29yLnRlc3RAdW5pdmVuLmFjLnphIiwicm9sZSI6IlNVUEVSVklTT1IiLCJpYXQiOjE3NjIyNTEyNzAsImV4cCI6MTc2MjMzNzY3MH0...",
  "role": "SUPERVISOR",
  "username": "supervisor.test@univen.ac.za",
  "email": "supervisor.test@univen.ac.za"
}
```

**⚠️ IMPORTANT:** Copy the new `token` from the response!

---

### **Step 2: Use the New Token**

Replace `YOUR_TOKEN_HERE` with the new token you just received:

```
GET http://localhost:8082/api/leave
Authorization: Bearer YOUR_NEW_TOKEN_HERE
```

---

## 🔍 Token Expiration

- **Token Validity:** 24 hours
- **Expiration Time:** Check the `exp` claim in the JWT token
- **After Expiration:** You must login again to get a new token

---

## 🧪 Quick Test

1. **Login:**
   ```
   POST http://localhost:8082/api/auth/login
   {
     "username": "supervisor.test@univen.ac.za",
     "password": "Supervisor123!"
   }
   ```

2. **Copy the token** from the response

3. **Use it immediately:**
   ```
   GET http://localhost:8082/api/leave
   Authorization: Bearer NEW_TOKEN_HERE
   ```

---

## ✅ Success Indicators

After getting a new token, you should see:
- ✅ No 401 error
- ✅ No 403 error
- ✅ Successful response with data

---

## 📝 Tips

1. **Always use fresh tokens** - Login before each testing session
2. **Token expires in 24 hours** - Plan accordingly
3. **Copy the entire token** - Make sure no spaces or newlines
4. **Use correct format:** `Authorization: Bearer YOUR_TOKEN`

---

## 🚀 Quick Fix Steps

1. ✅ Login → Get new token
2. ✅ Copy token from response
3. ✅ Use token in Authorization header
4. ✅ Test your endpoints

---

## ❌ Common Issues

### **Issue: "Invalid or expired token"**
**Solution:** Login again to get a fresh token

### **Issue: Token format error**
**Solution:** Use format: `Authorization: Bearer YOUR_TOKEN` (with space after Bearer)

### **Issue: Token still not working**
**Solution:** 
- Verify username/password are correct
- Check if user account exists
- Try logging in again

---

## 🎯 Next Steps

1. **Login** to get a new token
2. **Test** your endpoints with the new token
3. **All endpoints should work** now!

