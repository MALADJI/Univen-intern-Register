# Authentication Required - Quick Fix Guide

## ❌ Error: "Authentication required"

This means the **Authorization header is missing or incorrect** in your request.

---

## ✅ Solution: Add Authorization Header

### **Step 1: Make sure you have a token**

First, login to get a token:

```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "supervisor.test@univen.ac.za",
  "password": "Supervisor123!"
}
```

**Copy the `token` from the response.**

---

### **Step 2: Add Authorization Header**

In Postman, add the Authorization header:

**Header Name:** `Authorization`

**Header Value:** `Bearer YOUR_TOKEN_HERE`

**⚠️ IMPORTANT:**
- Must include the word `Bearer` followed by a space
- Then your token
- No quotes around the token
- No extra spaces or newlines

---

## 🔍 Correct Format in Postman

### **Option 1: Using Headers Tab**

1. Go to **Headers** tab in Postman
2. Add new header:
   - **Key:** `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiJ9...` (your full token)

### **Option 2: Using Authorization Tab**

1. Go to **Authorization** tab in Postman
2. Select **Type:** `Bearer Token`
3. Paste your token in the **Token** field
4. Postman will automatically format it as `Bearer YOUR_TOKEN`

---

## ✅ Correct Format Examples

### **✅ CORRECT:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcnZpc29yLnRlc3RAdW5pdmVuLmFjLnphIiwicm9sZSI6IlNVUEVSVklTT1IiLCJpYXQiOjE3NjIyNTEyNzAsImV4cCI6MTc2MjMzNzY3MH0.GC5VYrtoT4sCjVYDVAHAOKoAXJ0LOpSYOWODFf4nDBo
```

### **❌ WRONG:**
```
Authorization: eyJhbGciOiJIUzI1NiJ9... (missing "Bearer")
Authorization: Bearer  eyJhbGciOiJIUzI1NiJ9... (extra space)
Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9..." (quotes around value)
```

---

## 🧪 Test Your Setup

### **1. Login First:**
```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "supervisor.test@univen.ac.za",
  "password": "Supervisor123!"
}
```

### **2. Copy Token:**
From the response, copy the `token` value:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "SUPERVISOR",
  ...
}
```

### **3. Use Token in Request:**
```
GET http://localhost:8082/api/leave
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## 📝 Postman Setup Guide

### **Method 1: Headers Tab (Manual)**

1. Open your request in Postman
2. Click on **Headers** tab
3. Click **Add Header**
4. Enter:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_TOKEN_HERE`
5. Make sure header is **enabled** (checkbox checked)

### **Method 2: Authorization Tab (Recommended)**

1. Open your request in Postman
2. Click on **Authorization** tab
3. Select **Type:** `Bearer Token`
4. Paste your token in the **Token** field
5. Postman automatically formats it correctly

### **Method 3: Using Collection Variables**

1. In Postman collection, go to **Variables** tab
2. Set `token` variable with your token
3. Use in requests as: `Authorization: Bearer {{token}}`

---

## 🔍 Verify Your Header

After adding the header, verify it looks like this in Postman:

**Headers Tab:**
```
Authorization | Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Raw Request:**
```
GET /api/leave HTTP/1.1
Host: localhost:8082
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
User-Agent: PostmanRuntime/7.49.1
```

---

## ❌ Common Mistakes

### **Mistake 1: Missing "Bearer"**
```
Authorization: eyJhbGciOiJIUzI1NiJ9...
```
**Fix:** Add `Bearer ` before the token

### **Mistake 2: Extra Spaces**
```
Authorization: Bearer  eyJhbGciOiJIUzI1NiJ9...
```
**Fix:** Only one space after `Bearer`

### **Mistake 3: Quotes Around Token**
```
Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9..."
```
**Fix:** Remove quotes

### **Mistake 4: Wrong Header Name**
```
Auth: Bearer eyJhbGciOiJIUzI1NiJ9...
```
**Fix:** Use `Authorization` (not `Auth`)

### **Mistake 5: Token Expired**
```
Authorization: Bearer OLD_TOKEN
```
**Fix:** Login again to get a fresh token

---

## ✅ Success Checklist

- [ ] Login successful (got token)
- [ ] Token copied correctly (entire token)
- [ ] Authorization header added
- [ ] Header format: `Bearer YOUR_TOKEN`
- [ ] No extra spaces or quotes
- [ ] Token is fresh (not expired)

---

## 🚀 Quick Fix Steps

1. ✅ **Login** → Get token
2. ✅ **Copy** entire token
3. ✅ **Add** Authorization header
4. ✅ **Format:** `Bearer YOUR_TOKEN`
5. ✅ **Test** your request

---

## 🎯 Example Complete Request

**Request:**
```
GET http://localhost:8082/api/leave
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcnZpc29yLnRlc3RAdW5pdmVuLmFjLnphIiwicm9sZSI6IlNVUEVSVklTT1IiLCJpYXQiOjE3NjIyNTEyNzAsImV4cCI6MTc2MjMzNzY3MH0.GC5VYrtoT4sCjVYDVAHAOKoAXJ0LOpSYOWODFf4nDBo
```

**Expected Response:**
```json
[
  {
    "leaveRequestId": 1,
    "fromDate": "2024-12-25",
    "toDate": "2024-12-27",
    "leaveType": "ANNUAL",
    "status": "PENDING"
  }
]
```

---

## 📚 Additional Resources

- **Complete Auth Guide:** `POSTMAN_TEST_GUIDE_WITH_AUTH.md`
- **Token Expired Fix:** `TOKEN_EXPIRED_FIX.md`
- **Supervisor Guide:** `SUPERVISOR_COMPLETE_TEST_GUIDE.md`

---

## 🎉 You're All Set!

Follow these steps and your authentication should work perfectly!

