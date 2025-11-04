# Frontend Start Guide - Quick Fix

## 🚨 Frontend Not Running

Your Angular frontend is not currently running. Follow these steps to start it.

## 🚀 Quick Start

### Option 1: Using Batch Script (Windows)

1. **Double-click** `START_FRONTEND_QUICK.bat` in this directory
2. The script will:
   - Check if Node.js is installed
   - Check if Angular CLI is installed (install if needed)
   - Navigate to frontend directory
   - Install dependencies if needed
   - Start the Angular server

### Option 2: Manual Start (Recommended)

**Step 1: Open a new terminal/command prompt**

**Step 2: Navigate to frontend directory**
```powershell
cd "C:\Users\kulani.baloyi\Downloads\Intern-Register-System (5)\Intern-Register-System\Intern-Register-System"
```

**Note:** If your frontend is in a different location, navigate to that directory instead.

**Step 3: Check if Node.js is installed**
```powershell
node --version
```
Should show v16 or higher. If not, install Node.js from https://nodejs.org/

**Step 4: Check if Angular CLI is installed**
```powershell
ng version
```
If not installed, install it:
```powershell
npm install -g @angular/cli
```

**Step 5: Install dependencies (if needed)**
```powershell
npm install
```

**Step 6: Start the frontend server**
```powershell
ng serve
```

**Step 7: Wait for compilation**
You should see:
```
✔ Browser application bundle generation complete.
✔ Compiled successfully.

** Angular Live Development Server is listening on localhost:4200 **
```

**Step 8: Open in browser**
Navigate to: `http://localhost:4200`

## 🔍 Troubleshooting

### Issue 1: Frontend Directory Not Found

**Solution:** Find your frontend directory:
1. Look for a folder containing `package.json` and `angular.json`
2. Navigate to that directory
3. Run `ng serve` from there

### Issue 2: Port 4200 Already in Use

**Solution:** Use a different port:
```powershell
ng serve --port 4300
```

Or kill the process using port 4200:
```powershell
# Find process
netstat -ano | findstr :4200

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 3: Node.js Not Installed

**Solution:** 
1. Download and install Node.js from https://nodejs.org/
2. Restart your terminal
3. Verify installation: `node --version`

### Issue 4: Angular CLI Not Installed

**Solution:**
```powershell
npm install -g @angular/cli
```

### Issue 5: Dependencies Not Installed

**Solution:**
```powershell
# Delete node_modules and package-lock.json
rm -r node_modules
rm package-lock.json

# Reinstall
npm install
```

### Issue 6: Compilation Errors

**Solution:**
1. Check the error message in the terminal
2. Fix the errors in your code
3. The server will auto-reload after fixes

## 📋 Verification Checklist

After starting the frontend:

- [ ] Frontend server is running on port 4200
- [ ] Terminal shows "Angular Live Development Server is listening on localhost:4200"
- [ ] Browser can access `http://localhost:4200`
- [ ] No errors in the terminal
- [ ] Page loads without errors
- [ ] Backend is also running on port 8082

## 🔗 Both Servers Must Be Running

### Backend (Port 8082)
```powershell
# In one terminal
cd C:\Users\kulani.baloyi\Downloads\intern-register
mvn spring-boot:run
```

### Frontend (Port 4200)
```powershell
# In another terminal
cd "C:\Users\kulani.baloyi\Downloads\Intern-Register-System (5)\Intern-Register-System\Intern-Register-System"
ng serve
```

## ✅ Success Indicators

When frontend is running correctly:

1. **Terminal shows:**
   ```
   ✔ Compiled successfully.
   ** Angular Live Development Server is listening on localhost:4200 **
   ```

2. **Browser:**
   - Page loads at `http://localhost:4200`
   - No console errors (F12 → Console)
   - Can navigate between pages

3. **Network Tab:**
   - Requests to backend succeed
   - No CORS errors
   - API calls return data

## 🆘 Still Having Issues?

1. **Check frontend directory exists:**
   - Look for `package.json` file
   - Look for `angular.json` file
   - Verify you're in the correct directory

2. **Check for error messages:**
   - Read terminal output carefully
   - Look for specific error messages
   - Search for solutions online

3. **Verify prerequisites:**
   - Node.js is installed: `node --version`
   - npm is installed: `npm --version`
   - Angular CLI is installed: `ng version`

4. **Try clean install:**
   ```powershell
   # Delete node_modules
   rm -r node_modules
   rm package-lock.json
   
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall
   npm install
   
   # Start again
   ng serve
   ```

## 📞 Quick Reference

**Start Frontend:**
```powershell
ng serve
```

**Start on Different Port:**
```powershell
ng serve --port 4300
```

**Start and Open Browser:**
```powershell
ng serve --open
```

**Check if Frontend is Running:**
```powershell
netstat -ano | findstr :4200
```

**Frontend URL:**
```
http://localhost:4200
```

**Backend URL:**
```
http://localhost:8082
```

