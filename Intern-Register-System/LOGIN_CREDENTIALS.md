# Login Credentials & Setup Instructions

## 🔐 Default Login Credentials

After the backend starts, these default users are created in the MySQL database:

### Admin
- **Email:** `admin@univen.ac.za`
- **Password:** `admin123`
- **Role:** ADMIN

### Supervisor
- **Email:** `supervisor@univen.ac.za`
- **Password:** `supervisor123`
- **Role:** SUPERVISOR

### Intern
- **Email:** `intern@univen.ac.za`
- **Password:** `intern123`
- **Role:** INTERN

## ⚠️ Important Notes

1. **Backend Must Be Running:** The backend server must be running on `http://localhost:8082` before you can login
2. **Database:** Make sure MySQL is running and the database `internregister` exists
3. **CORS:** CORS has been configured to allow requests from `http://localhost:4200`

## 🚀 Quick Start

1. **Start Backend:**
   ```bash
   cd C:\Users\kulani.baloyi\Downloads\intern-register
   ./mvnw spring-boot:run
   ```
   Wait for: "Started InternRegisterApplication"

2. **Start Frontend:**
   ```bash
   cd Intern-Register-System
   npm start
   ```
   Wait for: "Local: http://localhost:4200/"

3. **Login:**
   - Open browser: `http://localhost:4200`
   - Use one of the credentials above
   - You'll be automatically redirected to your dashboard based on role

## 🔄 Password Reset

If you forgot your password:
1. Click "Forgot Password?" on the login page
2. Enter your email
3. Check the backend console for the verification code (it's displayed there for testing)
4. Enter the code and set a new password

## 📧 Verification Codes

For testing purposes, verification codes are:
- **Displayed in the backend console** (check the terminal where backend is running)
- **Returned in the API response** (shown in a popup on the frontend)
- **Valid for 10 minutes**

## 🐛 Troubleshooting

### CORS Errors
- Make sure backend is running on port 8082
- Restart backend after any CORS configuration changes

### 401 Unauthorized
- Check if token is stored in localStorage
- Try logging out and logging in again
- Verify credentials are correct

### 404 Not Found
- Make sure backend is running
- Check if the endpoint exists in the backend
- Restart backend after adding new endpoints

