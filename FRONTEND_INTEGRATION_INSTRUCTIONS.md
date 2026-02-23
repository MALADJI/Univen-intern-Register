# Frontend Integration Instructions

## 📋 Quick Start

### Step 1: Copy Service Files

Copy these files to your frontend project:

1. **`super-admin.service.ts`** → `src/app/services/super-admin.service.ts`
2. **`user-signature.service.ts`** → `src/app/services/user-signature.service.ts`

### Step 2: Create Super Admin Dashboard

Create directory: `src/app/super-admin/super-admin-dashboard/`

Copy these files:
1. **`super-admin-dashboard.component.ts`** → `src/app/super-admin/super-admin-dashboard/super-admin-dashboard.component.ts`
2. **`super-admin-dashboard.component.html`** → `src/app/super-admin/super-admin-dashboard/super-admin-dashboard.component.html`
3. **`super-admin-dashboard.component.css`** → `src/app/super-admin/super-admin-dashboard/super-admin-dashboard.component.css`

### Step 3: Update Existing Files

#### Update `src/app/services/auth.service.ts`

Add these updates from `auth.service-updates.ts`:
- Update `LoginResponse` interface to include `'SUPER_ADMIN'`
- Update `CurrentUser` interface to include `'SUPER_ADMIN'`
- Update `getUserRole()` return type
- Update `hasRole()` method
- Add `isSuperAdmin()` method
- Add `isAdminOrSuperAdmin()` method

#### Update `src/app/app.routes.ts`

Add the Super Admin route from `app.routes-updates.ts`:
```typescript
{
  path: 'super-admin/super-admin-dashboard',
  component: SuperAdminDashboardComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { expectedRoles: ['SUPER_ADMIN'] }
}
```

#### Update `src/app/guards/role.guard.ts`

Add `SUPER_ADMIN` support from `role.guard-updates.ts`:
- Update `expectedRoles` type
- Add redirect for `SUPER_ADMIN` role

#### Update `src/app/auth/login/login.component.ts`

Add redirect for Super Admin from `login.component-updates.ts`:
```typescript
if (role === 'SUPER_ADMIN') {
  this.router.navigate(['/super-admin/super-admin-dashboard']);
}
```

### Step 4: Install Dependencies (if needed)

Make sure you have Angular Material installed:
```bash
npm install @angular/material @angular/cdk @angular/animations
```

### Step 5: Test

1. **Start backend:**
   ```bash
   mvn spring-boot:run
   ```

2. **Start frontend:**
   ```bash
   ng serve
   ```

3. **Login as Super Admin:**
   - Email: `superadmin@univen.ac.za`
   - Password: `superadmin123`

4. **Test features:**
   - View all admins
   - Create new admin
   - Update admin signature

---

## 📝 File Structure

After integration, your frontend should have:

```
src/app/
├── services/
│   ├── super-admin.service.ts          [NEW]
│   ├── user-signature.service.ts        [NEW]
│   └── auth.service.ts                  [UPDATED]
├── super-admin/
│   └── super-admin-dashboard/
│       ├── super-admin-dashboard.component.ts    [NEW]
│       ├── super-admin-dashboard.component.html  [NEW]
│       └── super-admin-dashboard.component.css   [NEW]
├── guards/
│   └── role.guard.ts                    [UPDATED]
├── auth/
│   └── login/
│       └── login.component.ts           [UPDATED]
└── app.routes.ts                        [UPDATED]
```

---

## 🧪 Testing Endpoints

### 1. Test Super Admin Login
```http
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "superadmin@univen.ac.za",
  "password": "superadmin123"
}
```

### 2. Test Get All Admins
```http
GET http://localhost:8082/api/super-admin/admins
Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN
```

### 3. Test Create Admin
```http
POST http://localhost:8082/api/super-admin/admins
Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "ICT Admin",
  "email": "ictadmin@univen.ac.za",
  "password": "password123",
  "signature": "optional_base64_signature"
}
```

### 4. Test Get My Signature
```http
GET http://localhost:8082/api/users/me/signature
Authorization: Bearer YOUR_TOKEN
```

### 5. Test Update My Signature
```http
PUT http://localhost:8082/api/users/me/signature
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "signature": "data:image/png;base64,iVBORw0KGgo..."
}
```

---

## ✅ Checklist

- [ ] Copied `super-admin.service.ts` to `src/app/services/`
- [ ] Copied `user-signature.service.ts` to `src/app/services/`
- [ ] Created `super-admin-dashboard` component
- [ ] Updated `auth.service.ts` with SUPER_ADMIN support
- [ ] Updated `app.routes.ts` with Super Admin route
- [ ] Updated `role.guard.ts` with SUPER_ADMIN support
- [ ] Updated `login.component.ts` with Super Admin redirect
- [ ] Installed Angular Material dependencies
- [ ] Tested login as Super Admin
- [ ] Tested creating admin
- [ ] Tested signature upload

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@angular/material'"
**Solution:** Install Angular Material:
```bash
npm install @angular/material @angular/cdk @angular/animations
```

### Error: "Route not found"
**Solution:** Make sure you added the route to `app.routes.ts` and imported the component.

### Error: "401 Unauthorized"
**Solution:** 
- Check that you're logged in as Super Admin
- Verify the token is being sent in the Authorization header
- Check backend logs for authentication errors

### Error: "403 Forbidden"
**Solution:**
- Verify your user has `SUPER_ADMIN` role in the database
- Check that the role enum includes `SUPER_ADMIN`

---

## 📚 Additional Resources

- See `SUPER_ADMIN_AND_SIGNATURE_FEATURE.md` for backend details
- See `SUPER_ADMIN_AND_SIGNATURE_ENDPOINTS_TEST_GUIDE.md` for API testing
- See `FRONTEND_BACKEND_ENDPOINT_ANALYSIS.md` for endpoint connections

---

## 🎯 Next Steps

1. **Add Signature Pad Component** (optional):
   - Install: `npm install signature_pad`
   - Create a signature pad component for better UX

2. **Add Admin Management to Admin Dashboard**:
   - Allow regular admins to see their own profile
   - Add signature upload to admin profile

3. **Add Signature Display**:
   - Show signatures in reports/documents
   - Add signature preview in user profiles

---

**Need Help?** Check the backend logs and browser console for detailed error messages.

