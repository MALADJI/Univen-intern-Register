# Supervisor Dashboard Buttons - Implementation Complete

## ✅ Backend Endpoints Created

All buttons on the supervisor dashboard now have working backend endpoints:

### 1. **Test Alert Button** ✅
**Endpoint:** `GET /api/leave/test-alert`

**Purpose:** Test notification/alert system

**Request:**
```bash
GET http://localhost:8082/api/leave/test-alert
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "message": "Test alert notification",
  "type": "info",
  "timestamp": "2025-01-17T09:10:01",
  "data": {
    "title": "Test Alert",
    "body": "This is a test alert notification",
    "icon": "info"
  }
}
```

### 2. **Reset Seen Button** ✅
**Endpoint:** `PUT /api/leave/reset-seen`

**Purpose:** Reset all leave requests to unseen status

**Request:**
```bash
PUT http://localhost:8082/api/leave/reset-seen
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "message": "All leave requests reset to unseen",
  "count": 10
}
```

### 3. **Reload Data Button** ✅
**Endpoint:** `GET /api/leave` (already exists)

**Purpose:** Reload leave requests data

**Request:**
```bash
GET http://localhost:8082/api/leave?status=PENDING&seen=false
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `status` (optional) - Filter by status (PENDING, APPROVED, REJECTED)
- `departmentId` (optional) - Filter by department
- `seen` (optional) - Filter by seen status (true/false)

**Response:** Array of leave requests with `seen` field included

### 4. **Reset Filters Button** ✅
**Purpose:** Frontend-only functionality (no backend endpoint needed)

This button should reset all filter inputs on the frontend to their default values.

### 5. **Mark as Seen** ✅
**Endpoint:** `PUT /api/leave/{id}/seen`

**Purpose:** Mark a specific leave request as seen

**Request:**
```bash
PUT http://localhost:8082/api/leave/1/seen
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "message": "Leave request marked as seen",
  "requestId": 1,
  "seen": true
}
```

### 6. **Mark All as Seen** ✅
**Endpoint:** `PUT /api/leave/mark-all-seen`

**Purpose:** Mark all leave requests as seen

**Request:**
```bash
PUT http://localhost:8082/api/leave/mark-all-seen
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "message": "All leave requests marked as seen",
  "count": 10
}
```

## 📋 Database Changes

### Migration Required
Run the SQL migration to add the `seen` field:

```sql
ALTER TABLE leave_requests 
ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;

UPDATE leave_requests SET seen = FALSE WHERE seen IS NULL;
```

Or use the migration file:
```bash
mysql -u your_username -p your_database < ADD_SEEN_FIELD_TO_LEAVE_REQUESTS.sql
```

## 🔧 Frontend Integration

### Test Alert Button
```typescript
testAlert() {
  this.apiService.get('leave/test-alert').subscribe({
    next: (response) => {
      // Show alert/notification
      alert(response.data.body);
      // Or use your notification service
      this.notificationService.show(response.data.title, response.data.body);
    },
    error: (error) => {
      console.error('Error testing alert:', error);
    }
  });
}
```

### Reset Seen Button
```typescript
resetSeen() {
  this.apiService.put('leave/reset-seen', {}).subscribe({
    next: (response) => {
      alert(`Reset ${response.count} leave requests to unseen`);
      this.reloadData(); // Reload the data
    },
    error: (error) => {
      console.error('Error resetting seen status:', error);
    }
  });
}
```

### Reload Data Button
```typescript
reloadData() {
  this.loading = true;
  const params: any = {};
  
  // Add filters if they exist
  if (this.selectedStatus) params.status = this.selectedStatus;
  if (this.selectedDepartment) params.departmentId = this.selectedDepartment;
  if (this.showOnlyUnseen) params.seen = false;
  
  this.apiService.get('leave', params).subscribe({
    next: (data) => {
      this.leaveRequests = data;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error reloading data:', error);
      this.loading = false;
    }
  });
}
```

### Reset Filters Button
```typescript
resetFilters() {
  this.searchName = '';
  this.selectedDepartment = null;
  this.selectedField = null;
  this.selectedStatus = null;
  this.showOnlyUnseen = false;
  this.reloadData(); // Reload with cleared filters
}
```

### Mark Request as Seen (when viewing)
```typescript
markAsSeen(requestId: number) {
  this.apiService.put(`leave/${requestId}/seen`, {}).subscribe({
    next: (response) => {
      // Update the request in the list
      const request = this.leaveRequests.find(r => r.id === requestId);
      if (request) {
        request.seen = true;
      }
    },
    error: (error) => {
      console.error('Error marking as seen:', error);
    }
  });
}
```

## 📝 Response Format

All leave request responses now include the `seen` field:

```json
{
  "requestId": 1,
  "id": 1,
  "leaveType": "ANNUAL",
  "fromDate": "2025-01-20",
  "toDate": "2025-01-25",
  "startDate": "2025-01-20",
  "endDate": "2025-01-25",
  "status": "PENDING",
  "reason": "Family vacation",
  "seen": false,
  "createdAt": "2025-01-17T09:00:00",
  "updatedAt": "2025-01-17T09:00:00",
  "internId": 1,
  "internName": "John Doe",
  "internEmail": "john@example.com",
  "department": "ICT",
  "departmentId": 1
}
```

## 🎯 Next Steps

1. **Run Database Migration:**
   ```bash
   mysql -u your_username -p your_database < ADD_SEEN_FIELD_TO_LEAVE_REQUESTS.sql
   ```

2. **Restart Spring Boot Application:**
   ```bash
   mvn spring-boot:run
   ```

3. **Update Frontend:**
   - Wire up the buttons to call the new endpoints
   - Add `seen` field to the leave request display
   - Show visual indicator for unseen requests (e.g., badge, highlight)

4. **Test All Buttons:**
   - Test Alert - Should show notification
   - Reset Seen - Should reset all requests to unseen
   - Reload Data - Should refresh the list
   - Reset Filters - Should clear all filters
   - Mark as Seen - Should mark individual requests

## ✅ Summary

- ✅ Added `seen` field to `LeaveRequest` entity
- ✅ Created database migration SQL
- ✅ Added `markAsSeen()` method to service
- ✅ Added `resetAllSeen()` method to service
- ✅ Added `markAllAsSeen()` method to service
- ✅ Created `PUT /api/leave/{id}/seen` endpoint
- ✅ Created `PUT /api/leave/reset-seen` endpoint
- ✅ Created `PUT /api/leave/mark-all-seen` endpoint
- ✅ Created `GET /api/leave/test-alert` endpoint
- ✅ Updated all leave request responses to include `seen` field
- ✅ Added `seen` filter to `GET /api/leave` endpoint

All backend endpoints are ready! Just need to wire them up in the frontend.

