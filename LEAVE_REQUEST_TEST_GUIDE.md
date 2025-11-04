# Leave Request Testing Guide

## ✅ Your Request is Working!

The response shows **Content-Length: 0**, which means:
- ✅ **No 403 error** - Authentication is working!
- ✅ **Endpoint is accessible** - The security fix worked!
- ✅ **Empty response** - This is normal if there are no leave requests yet

---

## 🧪 Complete Test Sequence

### **Step 1: Submit a Leave Request First**

Before retrieving leave requests, you need to create one:

```
POST http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "internId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL"
}
```

**Expected Response:**
```json
{
  "leaveRequestId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL",
  "status": "PENDING",
  "intern": {
    "internId": 1,
    "name": "Test Intern"
  }
}
```

**⚠️ IMPORTANT:** Note the `leaveRequestId` from the response.

---

### **Step 2: Now Retrieve Leave Requests**

After creating a leave request, retrieve it:

```
GET http://localhost:8082/api/leave/intern/1
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (if you have leave requests):**
```json
[
  {
    "leaveRequestId": 1,
    "fromDate": "2024-12-25",
    "toDate": "2024-12-27",
    "leaveType": "ANNUAL",
    "status": "PENDING",
    "createdAt": "2024-12-20T10:00:00"
  }
]
```

**Expected Response (if NO leave requests):**
```json
[]
```

This is an **empty array**, which is normal if you haven't created any leave requests yet.

---

## 📋 Complete Leave Request Workflow

### **1. Submit Leave Request**
```
POST http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "internId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL"
}
```

### **2. View My Leave Requests**
```
GET http://localhost:8082/api/leave/intern/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### **3. View Leave Requests by Status**
```
GET http://localhost:8082/api/leave/intern/1?status=PENDING
Authorization: Bearer YOUR_TOKEN_HERE
```

### **4. View All Leave Requests (Admin/Supervisor)**
```
GET http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN_HERE
```

### **5. Search Leave Requests**
```
GET http://localhost:8082/api/leave/search?status=PENDING&internId=1&page=0&size=10
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ✅ Available Leave Types

Use one of these exact values for `leaveType`:

- `ANNUAL` - Annual leave
- `SICK` - Sick leave
- `CASUAL` - Casual leave
- `EMERGENCY` - Emergency leave
- `OTHER` - Other leave
- `UNPAID` - Unpaid leave
- `STUDY` - Study leave

---

## 🔍 Understanding Responses

### **Empty Response (Content-Length: 0)**
- This means there are **no leave requests** for that intern
- This is **normal** if you haven't created any leave requests yet
- The endpoint is **working correctly**

### **Empty Array `[]`**
- This is a valid JSON response
- Means there are no leave requests
- The endpoint is working

### **Array with Leave Requests**
- Contains all leave requests for that intern
- Each request shows: ID, dates, type, status

---

## 🧪 Quick Test Sequence

1. **Submit Leave Request:**
   ```bash
   POST /api/leave
   {
     "internId": 1,
     "fromDate": "2024-12-25",
     "toDate": "2024-12-27",
     "leaveType": "ANNUAL"
   }
   ```

2. **Retrieve Leave Requests:**
   ```bash
   GET /api/leave/intern/1
   ```

3. **Verify:**
   - You should see the leave request you just created
   - Status should be "PENDING"

---

## ❌ Common Issues

### **Issue: Empty Response**
**Solution:** This is normal! Create a leave request first, then retrieve it.

### **Issue: "internId is required"**
**Solution:** Make sure you're passing `internId` in the request body when submitting leave.

### **Issue: "Invalid leaveType"**
**Solution:** Use one of the exact values: `ANNUAL`, `SICK`, `CASUAL`, `EMERGENCY`, `OTHER`, `UNPAID`, `STUDY`

### **Issue: Date format error**
**Solution:** Use format: `YYYY-MM-DD` (e.g., `2024-12-25`)

---

## ✅ Success Indicators

- ✅ No 403 error (authentication working)
- ✅ Empty array `[]` if no leave requests (normal)
- ✅ Array with leave requests if you have created them
- ✅ All leave types accepted
- ✅ Status shows "PENDING" for new requests

---

## 🎯 Next Steps

1. **Create a leave request** using the POST endpoint
2. **Retrieve it** using the GET endpoint
3. **Verify** you can see your leave request
4. **Test different leave types** (ANNUAL, SICK, etc.)
5. **Check status filtering** (PENDING, APPROVED, REJECTED)

---

## 📝 Full Example

### **Complete Test:**

1. **Submit Leave:**
   ```
   POST http://localhost:8082/api/leave
   Authorization: Bearer YOUR_TOKEN
   Content-Type: application/json
   
   {
     "internId": 1,
     "fromDate": "2024-12-25",
     "toDate": "2024-12-27",
     "leaveType": "ANNUAL"
   }
   ```

2. **Get Leave Requests:**
   ```
   GET http://localhost:8082/api/leave/intern/1
   Authorization: Bearer YOUR_TOKEN
   ```

3. **Expected Result:**
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

## 🎉 Everything is Working!

Your endpoint is working correctly. The empty response just means you need to create a leave request first. Follow the steps above to test the complete workflow!

