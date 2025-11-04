# Frontend Quick Start - Fixed Path

## 🚀 Start Your Frontend

### Quick Method (Windows)

**Option 1: Double-click the batch file**
1. Double-click `START_FRONTEND.bat` in this directory
2. It will automatically find and start your frontend

**Option 2: Manual Start**

1. **Open a new terminal/command prompt**

2. **Navigate to frontend directory:**
   ```powershell
   cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend"
   ```

3. **Install dependencies (if needed):**
   ```powershell
   npm install
   ```

4. **Start the server:**
   ```powershell
   ng serve
   ```

5. **Wait for compilation:**
   You should see:
   ```
   ✔ Compiled successfully.
   ** Angular Live Development Server is listening on localhost:4200 **
   ```

6. **Open in browser:**
   Navigate to: `http://localhost:4200`

## 📋 Prerequisites Check

Before starting, verify:

- [ ] Node.js is installed: `node --version` (should show v16+)
- [ ] npm is installed: `npm --version`
- [ ] Angular CLI is installed: `ng version`
  - If not: `npm install -g @angular/cli`

## 🔧 Troubleshooting

### Port 4200 Already in Use

**Solution:** Use a different port:
```powershell
ng serve --port 4300
```

### Angular CLI Not Found

**Solution:**
```powershell
npm install -g @angular/cli
```

### Dependencies Not Installed

**Solution:**
```powershell
npm install
```

## ✅ Verification

After starting, verify:
- [ ] Frontend runs on `http://localhost:4200`
- [ ] No errors in terminal
- [ ] Browser can access the page
- [ ] Backend is also running on port 8082

## 🎯 Both Servers Running

**Terminal 1 - Backend:**
```powershell
cd C:\Users\kulani.baloyi\Downloads\intern-register
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```powershell
cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend"
ng serve
```

## 📍 Frontend Directory

**Correct Path:**
```
C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend
```

This directory should contain:
- `package.json`
- `angular.json`
- `src/` folder
- `node_modules/` (after npm install)

