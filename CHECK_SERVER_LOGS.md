# Check Server Logs for 500 Error

## 🔍 Debugging 500 Internal Server Error

I've added detailed logging to help identify the exact cause of the 500 error.

---

## ⚠️ Important: Check Server Console

When you make the request, **check the server console** for detailed error messages. You should see:

```
=== Getting Leave Requests ===
Status filter: none
Getting all leave requests
  [Service] Calling findAll() on repository...
  [Service] Repository returned X leave request(s)
  [Service] First request ID: 1
  [Service] First request intern: 1
✓ Found X leave request(s)
=== End Getting Leave Requests ===
```

OR if there's an error:

```
✗ ERROR getting leave requests:
  Message: [error message here]
  Class: [exception class name]
[stack trace]
```

---

## 🔍 What to Look For

### **1. LazyInitializationException**
**Error:** `LazyInitializationException` or `could not initialize proxy`
**Cause:** Trying to access lazy-loaded relationships outside a transaction
**Solution:** Already fixed with `@JsonIgnoreProperties`

### **2. Database Connection Error**
**Error:** `Cannot connect to database` or `Connection refused`
**Cause:** Database is not running or connection failed
**Solution:** Check if MySQL is running

### **3. NullPointerException**
**Error:** `NullPointerException`
**Cause:** Some entity or field is null
**Solution:** Check entity relationships

### **4. JSON Serialization Error**
**Error:** `JsonMappingException` or `Infinite recursion`
**Cause:** Circular reference in JSON serialization
**Solution:** Already fixed with `@JsonIgnoreProperties`

---

## 🧪 Test Steps

1. **Make the request:**
   ```
   GET http://localhost:8082/api/leave
   ```

2. **Immediately check server console** for error messages

3. **Share the error message** from the console so I can fix it

---

## 📝 What Information to Share

If you're still getting a 500 error, please share:

1. **The error message from server console** (the exact exception)
2. **The stack trace** (if available)
3. **Any other console output** around the time of the error

This will help me identify the exact issue!

---

## 🔧 Quick Check

Before sharing logs, verify:

- [ ] Server is running (check `netstat -ano | findstr :8082`)
- [ ] Database is connected (check for any connection errors in console)
- [ ] Server was restarted after code changes
- [ ] Check server console when making the request

---

## 🚀 Next Steps

1. **Make the request** in Postman
2. **Check server console immediately**
3. **Copy the error message** and stack trace
4. **Share it** so I can fix the exact issue

The detailed logging will show exactly what's failing!

