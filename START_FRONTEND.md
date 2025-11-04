# How to Start the Frontend Application

## 🚀 Quick Start Guide

### Step 1: Navigate to Frontend Directory

Based on your project structure, the frontend is in a separate directory. Navigate to it:

```powershell
cd "C:\Users\kulani.baloyi\Downloads\Intern-Register-System (5)\Intern-Register-System\Intern-Register-System"
```

**Note:** If your frontend is in a different location, navigate to wherever your Angular project is located.

### Step 2: Install Dependencies (if needed)

If you haven't installed dependencies or if `node_modules` is missing:

```powershell
npm install
```

### Step 3: Start the Frontend Server

```powershell
ng serve
```

Or if you're using npm scripts:

```powershell
npm start
```

### Step 4: Wait for Compilation

You should see:
```
✔ Browser application bundle generation complete.
✔ Compiled successfully.

** Angular Live Development Server is listening on localhost:4200 **
```

### Step 5: Open in Browser

Open your browser and navigate to:
```
http://localhost:4200
```

## 🔍 Troubleshooting

### Issue 1: "ng: command not found"

**Solution:** Install Angular CLI globally:
```powershell
npm install -g @angular/cli
```

### Issue 2: Port 4200 Already in Use

**Solution:** Use a different port:
```powershell
ng serve --port 4300
```

Or kill the process using port 4200:
```powershell
# Find process using port 4200
netstat -ano | findstr :4200

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 3: "Cannot find module" Errors

**Solution:** 
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Issue 4: Compilation Errors

**Solution:**
1. Check the error message in the terminal
2. Fix the errors in the code
3. The server will auto-reload after fixes

### Issue 5: Frontend Can't Connect to Backend

**Solution:**
1. Verify backend is running on port 8082:
   ```powershell
   netstat -ano | findstr :8082
   ```
2. Check frontend API service points to `http://localhost:8082/api`
3. Verify CORS is configured in backend (already done)

## 📋 Complete Startup Sequence

### Terminal 1: Backend Server
```powershell
# Navigate to backend directory
cd C:\Users\kulani.baloyi\Downloads\intern-register

# Start backend server
mvn spring-boot:run

# Wait for: "Started InternRegisterApplication"
```

### Terminal 2: Frontend Server
```powershell
# Navigate to frontend directory
cd "C:\Users\kulani.baloyi\Downloads\Intern-Register-System (5)\Intern-Register-System\Intern-Register-System"

# Install dependencies (first time only)
npm install

# Start frontend server
ng serve

# Wait for: "Angular Live Development Server is listening on localhost:4200"
```

## ✅ Verification Checklist

After starting both servers:

- [ ] Backend is running on `http://localhost:8082`
- [ ] Frontend is running on `http://localhost:4200`
- [ ] No errors in backend terminal
- [ ] No errors in frontend terminal
- [ ] Browser can access `http://localhost:4200`
- [ ] Frontend can make API calls to backend

## 🧪 Test the Connection

### 1. Open Browser
Navigate to: `http://localhost:4200`

### 2. Open DevTools (F12)
Go to **Network** tab

### 3. Try to Login
- Enter credentials
- Click login
- Check Network tab for requests to `http://localhost:8082/api/auth/login`

### 4. Verify Response
- Status should be `200 OK`
- Response should contain `token`, `role`, `username`

## 🔧 Alternative: Check if Frontend is Already Running

### Check if Port 4200 is in Use
```powershell
netstat -ano | findstr :4200
```

If you see a process, the frontend might already be running. Try accessing:
```
http://localhost:4200
```

## 📝 Common Commands

### Start Frontend
```powershell
ng serve
```

### Start Frontend on Different Port
```powershell
ng serve --port 4300
```

### Start Frontend with Open Browser
```powershell
ng serve --open
```

### Build for Production
```powershell
ng build --prod
```

### Check Angular Version
```powershell
ng version
```

### Check Node Version
```powershell
node --version
```

## 🚨 If Frontend Still Won't Start

1. **Check Node.js is installed:**
   ```powershell
   node --version
   ```
   Should show v16 or higher

2. **Check npm is installed:**
   ```powershell
   npm --version
   ```
   Should show v8 or higher

3. **Check Angular CLI is installed:**
   ```powershell
   ng version
   ```
   If not installed: `npm install -g @angular/cli`

4. **Check for errors in terminal:**
   - Read error messages carefully
   - Fix any compilation errors
   - Check for missing dependencies

5. **Try cleaning and reinstalling:**
   ```powershell
   # Delete node_modules and lock file
   rm -r node_modules
   rm package-lock.json
   
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall
   npm install
   
   # Start again
   ng serve
   ```

## 📞 Need More Help?

1. **Check frontend directory exists:**
   - Verify the path is correct
   - Check if `package.json` exists in frontend directory
   - Check if `angular.json` exists in frontend directory

2. **Check for error messages:**
   - Read terminal output carefully
   - Look for specific error messages
   - Search for error messages online

3. **Verify backend is running:**
   - Backend must be running before frontend can connect
   - Check backend logs for errors

## ✅ Success Indicators

When frontend is running correctly, you should see:

1. **In Terminal:**
   ```
   ✔ Browser application bundle generation complete.
   ✔ Compiled successfully.
   ** Angular Live Development Server is listening on localhost:4200 **
   ```

2. **In Browser:**
   - Page loads without errors
   - No console errors (F12 → Console)
   - Can navigate between pages
   - Can make API calls to backend

3. **Network Tab:**
   - Requests to `http://localhost:8082/api/*` succeed
   - No CORS errors
   - Responses return 200 OK

---

## 🎯 Quick Command Reference

```powershell
# Navigate to frontend
cd "C:\Users\kulani.baloyi\Downloads\Intern-Register-System (5)\Intern-Register-System\Intern-Register-System"

# Install dependencies
npm install

# Start frontend
ng serve

# Start on different port
ng serve --port 4300

# Start and open browser
ng serve --open
```

