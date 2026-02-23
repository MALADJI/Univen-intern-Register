# ✅ Location Assignment to Intern - Implementation Complete

## 📋 Summary

Successfully implemented the ability to assign locations to interns. This fixes the 404 error that was occurring when the frontend tried to assign a location to an intern.

## 🔧 Changes Made

### 1. **Intern Entity** (`src/main/java/com/internregister/entity/Intern.java`)
- ✅ Added `location` field with `@ManyToOne` relationship to `Location` entity
- ✅ Added `@JoinColumn(name = "location_id")` for database mapping

### 2. **InternRequest DTO** (`src/main/java/com/internregister/dto/InternRequest.java`)
- ✅ Added `locationId` field (optional, nullable)

### 3. **InternResponse DTO** (`src/main/java/com/internregister/dto/InternResponse.java`)
- ✅ Added `locationId` field
- ✅ Added `locationName` field

### 4. **InternService** (`src/main/java/com/internregister/service/InternService.java`)
- ✅ Added `LocationRepository` dependency
- ✅ Updated `createIntern()` to handle location assignment
- ✅ Updated `updateIntern()` to handle location assignment/removal
- ✅ Updated `toResponse()` to include location information
- ✅ Added new method `assignLocationToIntern()` for dedicated location assignment

### 5. **InternController** (`src/main/java/com/internregister/controller/InternController.java`)
- ✅ Added `LocationRepository` dependency
- ✅ Added new endpoint: `PUT /api/interns/{id}/location`
  - Accepts `{ "locationId": <id> }` or `{ "locationId": null }` to remove location
  - Returns success message and updated intern data

### 6. **Database Migration** (`ADD_LOCATION_TO_INTERN_MIGRATION.sql`)
- ✅ SQL script to add `location_id` column to `interns` table
- ✅ Foreign key constraint to `locations` table

## 🚀 How to Use

### Step 1: Run Database Migration

Execute the SQL migration script:

```sql
-- Run this in your MySQL database
ALTER TABLE interns 
ADD COLUMN location_id BIGINT NULL;

ALTER TABLE interns 
ADD CONSTRAINT fk_intern_location 
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
    ON DELETE SET NULL;
```

Or run the complete migration file:
```bash
mysql -u your_username -p your_database < ADD_LOCATION_TO_INTERN_MIGRATION.sql
```

### Step 2: Restart the Application

After running the migration, restart your Spring Boot application:

```bash
mvn spring-boot:run
```

### Step 3: Assign Location to Intern

#### Option A: Using the Dedicated Endpoint (Recommended)

```bash
PUT http://localhost:8082/api/interns/{internId}/location
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "locationId": 1
}
```

**Response (200 OK):**
```json
{
  "message": "Location assigned successfully",
  "intern": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "departmentId": 1,
    "departmentName": "ICT",
    "supervisorId": 1,
    "supervisorName": "Jane Supervisor",
    "locationId": 1,
    "locationName": "Main Building"
  }
}
```

#### Option B: Remove Location Assignment

```bash
PUT http://localhost:8082/api/interns/{internId}/location
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "locationId": null
}
```

#### Option C: Assign Location During Intern Creation/Update

```bash
POST http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Jane Intern",
  "email": "jane@example.com",
  "departmentId": 1,
  "supervisorId": 1,
  "locationId": 1
}
```

## 📝 API Endpoint Details

### `PUT /api/interns/{id}/location`

**Purpose:** Assign or remove a location from an intern

**Path Parameters:**
- `id` (Long) - The intern ID

**Request Body:**
```json
{
  "locationId": 1  // Location ID to assign, or null to remove
}
```

**Response Codes:**
- `200 OK` - Location assigned/removed successfully
- `400 Bad Request` - Invalid request format
- `404 Not Found` - Intern or Location not found
- `500 Internal Server Error` - Server error

**Response Body (Success):**
```json
{
  "message": "Location assigned successfully",
  "intern": {
    // Full intern details including locationId and locationName
  }
}
```

## ✅ Testing

### Test 1: Assign Location
```bash
curl -X PUT http://localhost:8082/api/interns/1/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"locationId": 1}'
```

### Test 2: Remove Location
```bash
curl -X PUT http://localhost:8082/api/interns/1/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"locationId": null}'
```

### Test 3: Get Intern with Location
```bash
curl -X GET http://localhost:8082/api/interns/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The response will include `locationId` and `locationName` if a location is assigned.

## 🔍 Frontend Integration

The frontend can now call the endpoint:

```typescript
// Assign location to intern
assignLocationToIntern(internId: number, locationId: number) {
  return this.http.put(`${this.apiUrl}/interns/${internId}/location`, {
    locationId: locationId
  });
}

// Remove location from intern
removeLocationFromIntern(internId: number) {
  return this.http.put(`${this.apiUrl}/interns/${internId}/location`, {
    locationId: null
  });
}
```

## ⚠️ Important Notes

1. **Database Migration Required** - You must run the SQL migration before using this feature
2. **Backward Compatible** - Existing interns will have `locationId = null` (no location assigned)
3. **Optional Field** - Location assignment is optional - interns can exist without a location
4. **Foreign Key Constraint** - The location must exist in the `locations` table before assignment
5. **Cascade Delete** - If a location is deleted, the intern's `location_id` will be set to NULL (ON DELETE SET NULL)

## 🎯 Next Steps

1. ✅ Run the database migration
2. ✅ Restart the Spring Boot application
3. ✅ Update frontend code to use the new endpoint: `PUT /api/interns/{id}/location`
4. ✅ Test the location assignment functionality

## 📚 Related Files

- `src/main/java/com/internregister/entity/Intern.java`
- `src/main/java/com/internregister/dto/InternRequest.java`
- `src/main/java/com/internregister/dto/InternResponse.java`
- `src/main/java/com/internregister/service/InternService.java`
- `src/main/java/com/internregister/controller/InternController.java`
- `ADD_LOCATION_TO_INTERN_MIGRATION.sql`

---

**Status:** ✅ Implementation Complete
**Date:** Implementation completed
**Issue Fixed:** 404 Error when assigning location to intern

