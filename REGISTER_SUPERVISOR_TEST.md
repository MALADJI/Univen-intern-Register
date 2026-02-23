# Register supervisor.test@univen.ac.za

## Step 1: Request Verification Code

**In browser console (F12) or Postman:**
```javascript
fetch('http://localhost:8082/api/auth/send-verification-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'supervisor.test@univen.ac.za' })
})
.then(r => r.json())
.then(data => {
  console.log('Verification code:', data.code);
  console.log('Code expires in 15 minutes');
})
.catch(e => console.error('Error:', e));
```

**Expected Response:**
```json
{
  "message": "Verification code sent to supervisor.test@univen.ac.za",
  "code": "123456"
}
```

**⚠️ IMPORTANT:** Copy the `code` - you'll need it in the next step!

## Step 2: Register the User

**In browser console (F12) or Postman:**
```javascript
fetch('http://localhost:8082/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'supervisor.test@univen.ac.za',
    email: 'supervisor.test@univen.ac.za',
    password: 'Supervisor123!',
    role: 'SUPERVISOR',
    verificationCode: '123456',  // Use the code from Step 1
    name: 'Test',
    surname: 'Supervisor',
    departmentId: 1  // Use an existing department ID
  })
})
.then(r => r.json())
.then(data => {
  console.log('Registration successful:', data);
})
.catch(e => console.error('Error:', e));
```

## Step 3: Login

After registration, login with:
- **Email:** `supervisor.test@univen.ac.za`
- **Password:** `Supervisor123!`

---

## Quick Alternative: Use Default Supervisor

If you don't want to register, use the default supervisor:
- **Email:** `supervisor@univen.ac.za`
- **Password:** `supervisor123`

This user is created automatically when the database is empty.

