# How to Assign Interns to Supervisor - Step by Step Guide

## 📋 Overview

This guide shows you how to manually assign interns to a supervisor using the API endpoint.

---

## 🔍 Step 1: Find Your Supervisor ID

First, you need to find the ID of the supervisor you want to assign interns to.

### Option A: Using API Call

```
GET http://localhost:8082/api/supervisors
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response Example:**
```json
[
  {
    "supervisorId": 1,
    "name": "John Supervisor",
    "email": "john.supervisor@univen.ac.za",
    "department": {
      "departmentId": 1,
      "name": "HR"
    }
  }
]
```

**Note:** The `supervisorId` is what you need (e.g., `1` in the example above).

### Option B: Check Admin Dashboard

If you're using the admin dashboard, the supervisor ID should be visible in the supervisors list.

---

## 🎯 Step 2: Assign Interns to Supervisor

### Option 1: Assign Interns by Field (Recommended)

If you want to assign only interns with a specific field (e.g., "recruiting"):

```
POST http://localhost:8082/api/supervisors/{supervisorId}/assign-interns
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "field": "recruiting"
}
```

**Example:**
```
POST http://localhost:8082/api/supervisors/1/assign-interns
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "field": "recruiting"
}
```

### Option 2: Assign All Unassigned Interns from Department

If you want to assign ALL unassigned interns from the supervisor's department (regardless of field):

```
POST http://localhost:8082/api/supervisors/{supervisorId}/assign-interns
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{}
```

**Example:**
```
POST http://localhost:8082/api/supervisors/1/assign-interns
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{}
```

---

## ✅ Step 3: Check the Response

### Success Response:
```json
{
  "message": "Successfully assigned interns to supervisor",
  "assignedCount": 1
}
```

- `assignedCount` tells you how many interns were assigned
- If `assignedCount` is 0, it means no unassigned interns were found matching the criteria

### Error Responses:

**401 Unauthorized:**
```json
{
  "error": "Not authenticated"
}
```
→ Make sure you're logged in as an ADMIN and include the Bearer token.

**403 Forbidden:**
```json
{
  "error": "Only admins can assign interns to supervisors"
}
```
→ Only ADMIN users can assign interns. Make sure you're logged in as an admin.

**404 Not Found:**
```json
{
  "error": "Supervisor not found with id: X"
}
```
→ Check that the supervisor ID is correct.

---

## 🛠️ Using Different Tools

### Using cURL (Command Line)

```bash
curl -X POST http://localhost:8082/api/supervisors/1/assign-interns \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"field": "recruiting"}'
```

### Using Postman

1. **Method:** POST
2. **URL:** `http://localhost:8082/api/supervisors/1/assign-interns`
3. **Headers:**
   - `Authorization`: `Bearer YOUR_TOKEN_HERE`
   - `Content-Type`: `application/json`
4. **Body (raw JSON):**
   ```json
   {
     "field": "recruiting"
   }
   ```
5. Click **Send**

### Using Browser Console (JavaScript)

```javascript
// First, get your token from localStorage
const token = localStorage.getItem('authToken');

// Then make the API call
fetch('http://localhost:8082/api/supervisors/1/assign-interns', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    field: 'recruiting'  // or {} for all interns
  })
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  alert(`Assigned ${data.assignedCount} intern(s) to supervisor`);
})
.catch(error => {
  console.error('Error:', error);
});
```

---

## 📝 Complete Example Workflow

### Scenario: Assign intern with "recruiting" field to supervisor ID 1

1. **Get Supervisor ID:**
   ```
   GET http://localhost:8082/api/supervisors
   ```
   → Find supervisor with name/email matching your supervisor
   → Note the `supervisorId` (e.g., `1`)

2. **Assign Interns:**
   ```
   POST http://localhost:8082/api/supervisors/1/assign-interns
   Authorization: Bearer YOUR_ADMIN_TOKEN
   Content-Type: application/json
   
   {
     "field": "recruiting"
   }
   ```

3. **Verify Assignment:**
   ```
   GET http://localhost:8082/api/supervisors/1
   ```
   → Check the `interns` array in the response
   → Your intern should now be listed

---

## 🔍 Troubleshooting

### Problem: `assignedCount` is 0

**Possible reasons:**
- Intern already has a supervisor assigned
- Intern is in a different department
- Field name doesn't match (case-sensitive matching)
- No interns exist in the database

**Solution:**
- Check intern's current supervisor: `GET /api/interns/{internId}`
- Verify intern's department matches supervisor's department
- Check field name matches exactly (e.g., "recruiting" vs "Recruiting")

### Problem: 401 Unauthorized

**Solution:**
- Make sure you're logged in as ADMIN
- Check that your token is valid (not expired)
- Include `Bearer ` prefix before token

### Problem: Intern still not showing

**Solution:**
- Refresh the supervisor dashboard
- Check backend logs for assignment confirmation
- Verify intern was actually assigned: `GET /api/interns/{internId}` and check `supervisorId`

---

## 💡 Tips

1. **Field Matching:** The field matching is case-insensitive, so "recruiting", "Recruiting", and "RECRUITING" all work the same.

2. **Multiple Assignments:** You can call this endpoint multiple times - it only assigns interns that don't already have a supervisor.

3. **Check Before Assigning:** Use `GET /api/interns` to see which interns are unassigned (have `supervisorId: null`).

4. **Backend Logs:** Check your backend console logs - you'll see detailed messages about which interns were assigned.

---

## 📞 Need Help?

If you encounter issues:
1. Check backend console logs for detailed error messages
2. Verify your admin token is valid
3. Ensure supervisor and intern are in the same department
4. Check that intern doesn't already have a supervisor assigned

