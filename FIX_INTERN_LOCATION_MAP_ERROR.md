# Fix: Intern Dashboard Map Error - Missing Location

## 🔍 Problem

Error: "Cannot initialize map: missing location or locations"

The intern dashboard is trying to initialize a map but can't find the location data even though the location has been assigned to the intern by admin.

## ✅ Fixes Applied

### 1. Updated `InternRepository.findByEmailWithDepartment()`
- Now also fetches the `location` relationship using `LEFT JOIN FETCH`
- Ensures location is loaded when fetching intern by email

### 2. Updated `AuthController.getCurrentUser()`
- Now includes location information in the `/api/auth/me` response for interns
- Returns: `locationId`, `locationName`, `locationLatitude`, `locationLongitude`, `locationRadius`

### 3. Added EntityGraph to `InternRepository.findAll()`
- Eagerly loads `department` and `location` when fetching all interns
- Ensures location data is available in `/api/interns` responses

## 📋 What the Frontend Should Receive

### From `/api/auth/me`:
```json
{
  "id": 1,
  "username": "intern@univen.ac.za",
  "email": "intern@univen.ac.za",
  "role": "INTERN",
  "department": "ICT",
  "departmentId": 1,
  "locationId": 1,
  "locationName": "Main Building",
  "locationLatitude": -22.9756,
  "locationLongitude": 30.4475,
  "locationRadius": 100
}
```

### From `/api/interns` (when intern fetches their profile):
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "intern@univen.ac.za",
    "departmentId": 1,
    "departmentName": "ICT",
    "locationId": 1,
    "locationName": "Main Building"
  }
]
```

## 🔧 Next Steps

1. **Restart Spring Boot application** to apply the changes

2. **Verify location is assigned** in database:
   ```sql
   SELECT intern_id, name, email, location_id 
   FROM interns 
   WHERE email = 'intern@univen.ac.za';
   ```

3. **Test the endpoints**:
   - `GET /api/auth/me` - Should include location info
   - `GET /api/interns` - Should include locationId and locationName

4. **Check frontend** - The intern dashboard should now receive location data and be able to initialize the map

## 🎯 Expected Behavior After Fix

- Intern dashboard should receive location data from `/api/auth/me` or `/api/interns`
- Map should initialize with the assigned location
- Location coordinates and radius should be available for geofencing

## ⚠️ If Still Not Working

1. **Check browser console** for the exact error message
2. **Verify location assignment** in database (location_id should not be NULL)
3. **Check network tab** to see what data is being returned from the API
4. **Verify frontend code** is using the location data correctly

