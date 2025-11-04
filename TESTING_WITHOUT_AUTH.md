# Testing Without Authentication

## ✅ Authentication Temporarily Disabled for Testing

I've temporarily made the following endpoints **accessible without authentication** for testing:

- ✅ `/api/leave/**` - All leave request endpoints
- ✅ `/api/attendance/**` - All attendance endpoints
- ✅ `/api/interns/**` - All intern endpoints
- ✅ `/api/supervisors/**` - All supervisor endpoints
- ✅ `/api/departments/**` - All department endpoints

---

## 🧪 Test Without Authorization Header

You can now test these endpoints **without the Authorization header**:

### **View All Leave Requests:**
```
GET http://localhost:8082/api/leave
```

**No Authorization header needed!**

### **View All Interns:**
```
GET http://localhost:8082/api/interns
```

### **View All Attendance:**
```
GET http://localhost:8082/api/attendance
```

### **View All Supervisors:**
```
GET http://localhost:8082/api/supervisors
```

### **View All Departments:**
```
GET http://localhost:8082/api/departments
```

---

## ⚠️ Important: Restart Server

**You must restart the server** for these changes to take effect:

1. **Stop the server:** Press `Ctrl+C` in the terminal
2. **Start again:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
3. **Wait for startup** (15-20 seconds)

---

## 🧪 Test Sequence (No Auth Required)

### **1. View Leave Requests:**
```
GET http://localhost:8082/api/leave
```

### **2. Create Leave Request:**
```
POST http://localhost:8082/api/leave
Content-Type: application/json

{
  "internId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL"
}
```

### **3. View Attendance:**
```
GET http://localhost:8082/api/attendance
```

### **4. Sign In:**
```
POST http://localhost:8082/api/attendance/signin
Content-Type: application/json

{
  "internId": 1,
  "location": "Main Building",
  "latitude": -22.9756,
  "longitude": 30.4475
}
```

### **5. View Interns:**
```
GET http://localhost:8082/api/interns
```

---

## 🔒 Still Requires Authentication

These endpoints still require authentication:
- `/api/admins/**` - Admin endpoints
- `/api/reports/**` - Report endpoints
- Other protected endpoints

---

## ⚠️ Security Note

**This is for TESTING ONLY!**

In production, you should:
1. Remove the `.permitAll()` for these endpoints
2. Require proper authentication
3. Use role-based access control

**Current setting:** These endpoints are public for testing purposes.

---

## ✅ After Restart

Once the server restarts, you can test all the endpoints above **without any Authorization header**!

Just make the request without the `Authorization: Bearer ...` header.

---

## 🎯 Quick Test

Try this now (after restart):

```
GET http://localhost:8082/api/leave
```

**No Authorization header needed!** It should work immediately.

