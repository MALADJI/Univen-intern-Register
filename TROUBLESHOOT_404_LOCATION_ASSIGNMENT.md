# 🔧 Troubleshooting 404 Error: Location Assignment

## Current Status

The backend endpoint has been implemented: `PUT /api/interns/{id}/location`

However, you're still getting a 404 error. This means one of the following:

## ✅ Checklist - Verify These Steps

### 1. **Database Migration** ⚠️ CRITICAL
**Have you run the database migration?**

The `location_id` column must exist in the `interns` table before the endpoint will work.

**Check if column exists:**
```sql
DESCRIBE interns;
-- OR
SHOW COLUMNS FROM interns LIKE 'location_id';
```

**If the column doesn't exist, run:**
```sql
ALTER TABLE interns 
ADD COLUMN location_id BIGINT NULL;

ALTER TABLE interns 
ADD CONSTRAINT fk_intern_location 
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
    ON DELETE SET NULL;
```

Or run the migration file:
```bash
mysql -u your_username -p your_database < ADD_LOCATION_TO_INTERN_MIGRATION.sql
```

### 2. **Application Restart** ⚠️ REQUIRED
**Have you restarted the Spring Boot application after making the code changes?**

The new endpoint won't be available until you restart:
```bash
# Stop the current application (Ctrl+C)
# Then restart:
mvn spring-boot:run
```

### 3. **Verify Endpoint is Available**
**Test if the endpoint exists:**

```bash
# Check if endpoint is registered (should return 404 for missing intern, not "endpoint not found")
curl -X PUT http://localhost:8082/api/interns/999/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"locationId": 1}'
```

**Expected responses:**
- ✅ `404 {"error": "Intern not found"}` - Endpoint exists, intern doesn't
- ✅ `404 {"error": "Location not found"}` - Endpoint exists, location doesn't
- ❌ `404 Not Found` (no body) - Endpoint doesn't exist (application not restarted)

### 4. **Check Frontend API Call**
**What URL is the frontend actually calling?**

Open browser DevTools → Network tab → Look for the failed request:

**Expected URL:**
```
PUT http://localhost:8082/api/interns/{internId}/location
```

**Common mistakes:**
- ❌ `PUT /api/interns/{id}/assign-location` (wrong path)
- ❌ `POST /api/interns/{id}/location` (wrong method)
- ❌ `PUT /api/interns/location/{id}` (wrong path order)

### 5. **Check Request Body Format**
**Is the request body correct?**

**Correct format:**
```json
{
  "locationId": 1
}
```

**Common mistakes:**
- ❌ `{ "location": 1 }` (wrong field name)
- ❌ `{ "locationId": "1" }` (string instead of number - should still work but check)
- ❌ Missing body entirely

## 🔍 Debug Steps

### Step 1: Check Application Logs
When you start the application, you should see Spring Boot registering the endpoint:

```
Mapped "{[/api/interns/{id}/location],methods=[PUT]}"
```

If you don't see this, the endpoint isn't registered.

### Step 2: Test with Postman/curl
Test the endpoint directly:

```bash
# 1. Get a valid intern ID
curl http://localhost:8082/api/interns \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Get a valid location ID
curl http://localhost:8082/api/locations \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Assign location
curl -X PUT http://localhost:8082/api/interns/1/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"locationId": 1}'
```

### Step 3: Check Frontend Code
Find where the frontend is making the call. Look for:

```typescript
// Should be something like:
this.http.put(`/api/interns/${internId}/location`, { locationId: locationId })
```

**Common issues:**
- Wrong base URL
- Wrong endpoint path
- Wrong HTTP method
- Missing request body

## 🚨 Most Common Issues

### Issue 1: Database Column Missing
**Symptom:** Application starts but endpoint returns 500 error or database error

**Solution:** Run the migration SQL

### Issue 2: Application Not Restarted
**Symptom:** Endpoint returns 404 with no error message

**Solution:** Restart the Spring Boot application

### Issue 3: Wrong Endpoint Path
**Symptom:** 404 error persists after restart

**Solution:** Check the Network tab to see the exact URL being called

### Issue 4: CORS Issues
**Symptom:** CORS error in browser console

**Solution:** Check `@CrossOrigin` annotation in `InternController` (should be `origins = "*"`)

## 📝 Quick Fix Script

Run these commands in order:

```bash
# 1. Stop the application (if running)
# Press Ctrl+C in the terminal running the app

# 2. Run database migration
mysql -u your_username -p your_database < ADD_LOCATION_TO_INTERN_MIGRATION.sql

# 3. Verify column was added
mysql -u your_username -p your_database -e "DESCRIBE interns;"

# 4. Restart application
mvn spring-boot:run

# 5. Test endpoint
curl -X PUT http://localhost:8082/api/interns/1/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"locationId": 1}'
```

## 🎯 Next Steps

1. **Run the database migration** (if not done)
2. **Restart the Spring Boot application**
3. **Check the browser Network tab** to see the exact URL being called
4. **Update frontend code** if the URL is wrong
5. **Test with curl/Postman** to verify backend works

## 📞 Still Having Issues?

If you've completed all steps and still get 404:

1. **Share the exact URL** from the browser Network tab
2. **Share the application startup logs** (look for endpoint mappings)
3. **Share the database schema** (`DESCRIBE interns;`)
4. **Share the frontend code** that's making the API call

