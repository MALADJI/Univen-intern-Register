# Fix NULL Active Column for Interns

## 🔍 Problem

The `active` column for intern users is `NULL`, which can cause authentication issues. The JWT filter checks if `active` is `true`, and `NULL` is treated as inactive.

## ✅ Solutions

### Option 1: Update All Interns by Email (Recommended)

Since `email` is a unique column, this will work with safe update mode:

```sql
UPDATE users SET active = TRUE WHERE role = 'INTERN' AND email IS NOT NULL;
```

This will:
- Set `active = TRUE` for all interns
- Only update rows where email exists (safe)
- Works with MySQL safe update mode

### Option 2: Update Only NULL Values

If you only want to update interns where `active` is `NULL`:

```sql
UPDATE users SET active = TRUE WHERE role = 'INTERN' AND email IS NOT NULL AND active IS NULL;
```

### Option 3: Update All Users (Interns, Supervisors, Admins)

If you want to fix all users at once:

```sql
UPDATE users SET active = TRUE WHERE email IS NOT NULL AND (active IS NULL OR active = FALSE);
```

### Option 4: Check First, Then Update

**Step 1:** Check which interns have NULL active:

```sql
SELECT id, username, email, role, active FROM users WHERE role = 'INTERN' AND (active IS NULL OR active = FALSE);
```

**Step 2:** Update by ID (use IDs from Step 1):

```sql
UPDATE users SET active = TRUE WHERE id IN (1, 2, 3, 4, 5); -- Replace with actual IDs
```

## 🎯 Quick Fix (Recommended)

Run this single command:

```sql
UPDATE users SET active = TRUE WHERE role = 'INTERN' AND email IS NOT NULL;
```

This will:
- ✅ Work with safe update mode (uses `email` which is unique)
- ✅ Set all interns to active
- ✅ Fix NULL values
- ✅ Fix FALSE values

## ✅ After Running the Update

1. **Verify the update worked:**
   ```sql
   SELECT id, username, email, role, active FROM users WHERE role = 'INTERN';
   ```
   All interns should now have `active = 1` (or `TRUE`).

2. **Restart your Spring Boot application:**
   ```bash
   # Stop (Ctrl+C)
   mvn spring-boot:run
   ```

3. **Test the authentication** - The 403 error should be resolved!

## 🔧 Why This Happens

The `active` column might be `NULL` if:
- Users were created before the `active` column was added
- The default value wasn't set when the column was created
- Manual database inserts didn't include the `active` value

## 📋 Prevent Future Issues

To prevent this in the future, you can set a default value:

```sql
ALTER TABLE users MODIFY COLUMN active BOOLEAN DEFAULT TRUE NOT NULL;
```

This ensures:
- New users default to `active = TRUE`
- `NULL` values are not allowed
- Existing `NULL` values need to be fixed first (run the UPDATE above)

