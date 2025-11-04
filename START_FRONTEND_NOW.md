# 🚀 Start Your Frontend - Step by Step

## Quick Fix for Frontend Not Running

Based on your browser errors, the frontend server stopped. Here's how to start it again.

## 📍 Step 1: Open a New Terminal

Open a **new terminal/command prompt** (keep your backend terminal running).

## 📍 Step 2: Navigate to Frontend Directory

```powershell
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
```

## 📍 Step 3: Check if Dependencies are Installed

```powershell
# Check if node_modules exists
dir node_modules
```

**If node_modules doesn't exist or is empty:**
```powershell
npm install
```

## 📍 Step 4: Start the Frontend Server

Try these commands in order:

### Option 1: npm start
```powershell
npm start
```

### Option 2: Angular CLI
```powershell
ng serve
```

### Option 3: Vite (if using Angular with Vite)
```powershell
npx vite
```

### Option 4: Check package.json for scripts
```powershell
# View package.json
Get-Content package.json
```

Look for a "scripts" section with "start", "dev", or "serve" command.

## ✅ Expected Output

When frontend starts successfully, you should see:

**For Angular CLI:**
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

**For Vite:**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:4200/
```

## 🔧 Common Issues & Solutions

### Issue: "npm start" command not found

**Solution:** Check package.json has a scripts section:
```powershell
Get-Content package.json
```

If scripts are missing, the project might need setup. Try:
```powershell
ng serve
```

### Issue: Port 4200 already in use

**Solution:**
```powershell
ng serve --port 4300
```

### Issue: Angular CLI not found

**Solution:**
```powershell
npm install -g @angular/cli
```

### Issue: Node modules not installed

**Solution:**
```powershell
npm install
```

## 🎯 Complete Startup (Two Terminals)

### Terminal 1: Backend (Already Running)
```
✅ Backend running on http://localhost:8082
```

### Terminal 2: Frontend (Start This)
```powershell
# Navigate to frontend
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"

# Install dependencies (if needed)
npm install

# Start frontend
npm start
# OR
ng serve
```

## 📋 Verification Checklist

After starting frontend:

- [ ] Terminal shows "listening on localhost:4200"
- [ ] No errors in terminal
- [ ] Browser can access `http://localhost:4200`
- [ ] Page loads without errors
- [ ] Backend is also running on port 8082

## 🆘 Still Not Working?

1. **Check Node.js is installed:**
   ```powershell
   node --version
   ```
   Should show v16 or higher

2. **Check npm is installed:**
   ```powershell
   npm --version
   ```

3. **Check Angular CLI:**
   ```powershell
   ng version
   ```
   If not found: `npm install -g @angular/cli`

4. **Verify frontend directory:**
   ```powershell
   cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
   dir
   ```
   Should see: `package.json`, `src/` folder

5. **Check for errors:**
   - Read terminal output carefully
   - Look for specific error messages
   - Fix any compilation errors

## 🚀 Quick Command Reference

```powershell
# Navigate to frontend
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"

# Install dependencies
npm install

# Start server (try these in order)
npm start
ng serve
npx vite

# Start on different port
ng serve --port 4300
```

## 📝 Important Notes

- **Frontend must be running** for the browser to connect
- **Backend must also be running** on port 8082
- **Both servers** need to run simultaneously
- **Clear browser cache** if you see connection errors
- **Re-login** after starting frontend to get a new token

## ✅ After Frontend Starts

1. Open browser: `http://localhost:4200`
2. Clear localStorage (F12 → Console):
   ```javascript
   localStorage.clear();
   ```
3. Login again to get a new token
4. Test the application

---

**Your frontend should now be running!** 🎉

