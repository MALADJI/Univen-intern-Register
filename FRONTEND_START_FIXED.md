# Frontend Start Guide - Complete Fix

## 🚀 Quick Start Commands

### Step 1: Navigate to Frontend Directory

```powershell
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
```

### Step 2: Install Dependencies (if needed)

```powershell
npm install
```

### Step 3: Start the Frontend

**For Angular with Vite (Angular 20):**
```powershell
npm start
```

**Or if using Angular CLI:**
```powershell
ng serve
```

**Or if using Vite directly:**
```powershell
npx vite
```

## 📋 Complete Startup Process

### Terminal 1: Backend (Keep Running)
```powershell
cd C:\Users\kulani.baloyi\Downloads\intern-register
mvn spring-boot:run
```

### Terminal 2: Frontend (New Terminal)
```powershell
# Navigate to frontend
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"

# Install dependencies (first time only, or if node_modules is missing)
npm install

# Start frontend server
npm start
# OR
ng serve
# OR  
npx vite
```

## 🔍 Troubleshooting

### Issue 1: Package.json Missing Scripts

**Check package.json:**
```powershell
Get-Content package.json
```

**If scripts are missing, you may need to:**
1. Check if this is the correct Angular project
2. Verify Angular is properly set up
3. Check for alternative start commands

### Issue 2: Node Modules Not Installed

**Solution:**
```powershell
npm install
```

### Issue 3: Port 4200 Already in Use

**Solution:**
```powershell
# Use different port
ng serve --port 4300
# OR
npm start -- --port 4300
```

### Issue 4: Angular CLI Not Found

**Solution:**
```powershell
npm install -g @angular/cli
```

### Issue 5: Vite Connection Errors

Based on your browser errors, you're using Angular with Vite. The WebSocket errors are normal if the dev server isn't running.

**Solution:**
1. Make sure frontend server is running
2. Check that port 4200 is available
3. Restart the frontend server

## 🎯 What to Check

1. **Verify Frontend Directory:**
   ```powershell
   cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
   dir
   ```
   Should see: `package.json`, `src/` folder, etc.

2. **Check Node.js:**
   ```powershell
   node --version
   ```
   Should show v16 or higher

3. **Check npm:**
   ```powershell
   npm --version
   ```

4. **Check if Port 4200 is Free:**
   ```powershell
   netstat -ano | findstr :4200
   ```
   Should be empty (no process using it)

## ✅ Success Indicators

When frontend starts successfully, you should see:

```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

Or for Vite:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:4200/
  ➜  Network: use --host to expose
```

## 📍 Frontend Directory

**Confirmed Path:**
```
C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend
```

## 🚀 Quick Start Script

I've created `START_FRONTEND_SIMPLE.bat` that will:
1. Navigate to the frontend directory
2. Check if dependencies are installed
3. Install if needed
4. Start the server

**Just double-click it to start!**

## 📝 Next Steps

1. **Start backend** (if not already running):
   ```powershell
   cd C:\Users\kulani.baloyi\Downloads\intern-register
   mvn spring-boot:run
   ```

2. **Start frontend**:
   ```powershell
   cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
   npm install
   npm start
   ```

3. **Open browser:**
   ```
   http://localhost:4200
   ```

4. **Clear browser storage and login:**
   - Clear localStorage
   - Login again to get new token (after JWT fix)
   - Test the application

## 🔧 If Still Not Working

1. **Check package.json has scripts:**
   ```powershell
   Get-Content package.json | Select-String "scripts"
   ```

2. **Check for vite.config or angular.json:**
   ```powershell
   dir *.json
   dir vite.config.*
   dir angular.json
   ```

3. **Try different start commands:**
   - `npm start`
   - `ng serve`
   - `npx vite`
   - `npm run dev`

4. **Check for errors in terminal:**
   - Read error messages carefully
   - Fix any compilation errors
   - Install missing dependencies

