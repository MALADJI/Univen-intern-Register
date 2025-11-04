# Frontend Start Instructions - Simple Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Open New Terminal
Open a **new terminal window** (keep backend terminal running).

### Step 2: Navigate and Install
```powershell
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
npm install
```

### Step 3: Start Server
```powershell
npm start
```
OR
```powershell
ng serve
```

## ✅ That's It!

The frontend will start on `http://localhost:4200`

## 🔍 What Was Wrong?

**Problem:** `node_modules` folder was missing (dependencies not installed)

**Solution:** Run `npm install` to install all dependencies

## 📋 Complete Commands

```powershell
# 1. Navigate to frontend
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"

# 2. Install dependencies (REQUIRED - this was missing!)
npm install

# 3. Start frontend server
npm start
# OR
ng serve
```

## 🎯 Verification

After running `npm install` and `npm start`, you should see:
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

Then open: `http://localhost:4200`

## 🚨 Important

1. **Backend must be running** on port 8082
2. **Frontend must be running** on port 4200
3. **Both servers** need to run at the same time
4. **Clear browser storage** and login again after starting

## 📝 Quick Reference

**Frontend Directory:**
```
C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend
```

**Commands:**
```powershell
npm install    # Install dependencies (REQUIRED FIRST TIME)
npm start      # Start frontend server
ng serve       # Alternative: Start with Angular CLI
```

**URLs:**
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8082`

## 🆘 Troubleshooting

### If "npm install" fails:
- Check Node.js is installed: `node --version`
- Check npm is installed: `npm --version`
- Check internet connection

### If "npm start" fails:
- Check package.json has scripts section
- Try: `ng serve` instead
- Check for errors in terminal

### If port 4200 is in use:
```powershell
ng serve --port 4300
```

---

**Run `npm install` first, then `npm start` - that's all you need!** 🚀

