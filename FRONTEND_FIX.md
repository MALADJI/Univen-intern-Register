# Frontend Not Running - Quick Fix

## 🚀 Start Your Frontend (Quick Steps)

### Method 1: Using Batch Script

1. **Double-click** `START_FRONTEND_SIMPLE.bat` in this directory
2. The script will automatically start your frontend

### Method 2: Manual Start

**Open a new terminal and run:**

```powershell
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
ng serve
```

**If dependencies are not installed:**
```powershell
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
npm install
ng serve
```

## 📍 Frontend Directory Location

**Correct Path:**
```
C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend
```

## ✅ Verification

After starting, you should see:
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

Then open: `http://localhost:4200`

## 🔧 Quick Troubleshooting

### If "ng: command not found"
```powershell
npm install -g @angular/cli
```

### If Port 4200 is in use
```powershell
ng serve --port 4300
```

### If compilation errors
- Check the error messages in terminal
- Fix the errors
- Server will auto-reload

## 🎯 Complete Startup Sequence

**Terminal 1 - Backend (already running):**
```
http://localhost:8082
```

**Terminal 2 - Frontend:**
```powershell
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
ng serve
```

**Then open browser:**
```
http://localhost:4200
```

## 📋 Checklist

- [ ] Frontend directory exists
- [ ] Node.js is installed (`node --version`)
- [ ] Angular CLI is installed (`ng version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend server started (`ng serve`)
- [ ] Browser can access `http://localhost:4200`
- [ ] Backend is running on `http://localhost:8082`

