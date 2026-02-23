# Fix NULL Active Column - Step by Step

## 🔍 Problem

MySQL safe update mode requires using the primary key (`id`) in the WHERE clause. Even though `email` is unique, MySQL might not recognize it as a key column for safe update purposes.

## ✅ Solution: Use Primary Key (ID)

### Step 1: Find Intern IDs That Need Updating

Run this to see which interns have NULL or FALSE active:

```sql
SELECT id, username, email, role, active FROM users WHERE role = 'INTERN' AND (active IS NULL OR active = FALSE);
```

**Note the IDs** from the results (e.g., 1, 2, 3, 4, 5).

### Step 2: Update Using IDs

Use the IDs from Step 1:

```sql
UPDATE users SET active = TRUE WHERE id IN (1, 2, 3, 4, 5);
```

Replace `(1, 2, 3, 4, 5)` with the actual IDs from Step 1.

## 🎯 Alternative: Use Subquery (Single Command)

If you want to do it in one command, use a subquery:

```sql
UPDATE users 
SET active = TRUE 
WHERE id IN (
    SELECT id FROM (
        SELECT id FROM users 
        WHERE role = 'INTERN' AND email IS NOT NULL AND (active IS NULL OR active = FALSE)
    ) AS temp
);
```

**Note:** The double subquery (`SELECT id FROM (SELECT id FROM ...) AS temp`) is needed because MySQL doesn't allow updating a table that's also used in the subquery directly.

## 🔧 Alternative: Update One by One

If you know the intern emails, update them one by one:

```sql
UPDATE users SET active = TRUE WHERE email = 'intern@univen.ac.za' AND role = 'INTERN';
UPDATE users SET active = TRUE WHERE email = 'intern2@univen.ac.za' AND role = 'INTERN';
-- Add more as needed
```

## ✅ After Running the Update

1. **Verify it worked:**
   ```sql
   SELECT id, username, email, role, active FROM users WHERE role = 'INTERN';
   ```
   All interns should now have `active = 1` (or `TRUE`).

2. **Restart your Spring Boot application:**
   ```bash
   # Stop (Ctrl+C)
   mvn spring-boot:run
   ```

3. **Test authentication** - The 403 error should be resolved!

## 🎯 Recommended Approach

**Use Step 1 + Step 2** (the two-step approach) - it's the most reliable and clear:

1. Run the SELECT to see which IDs need updating
2. Copy the IDs
3. Run the UPDATE with those IDs

This is guaranteed to work with safe update mode!

