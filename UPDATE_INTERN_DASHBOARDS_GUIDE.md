# Update Intern Dashboards - Add ID Number, Start Date, End Date

## Overview
This guide provides the exact changes needed to add `idNumber`, `startDate`, and `endDate` fields to all dashboard tables that display intern information.

## Backend Status ✅
The backend already includes these fields:
- `InternResponse` DTO has `idNumber`, `startDate`, `endDate`
- `InternService.toResponse()` method maps these fields (lines 251-253)
- API endpoints return these fields in responses

## Frontend Updates Required

### 1. Admin Dashboard

#### File: `src/app/admin/admin-dashboard/admin-dashboard.ts`

**Update Intern Interface:**
```typescript
interface Intern {
  id?: number;
  internId?: number;
  name: string;
  email: string;
  idNumber?: string; // ID Number from sign-up
  startDate?: string; // Internship start date
  endDate?: string; // Internship end date
  supervisor: string;
  supervisorName?: string;
  supervisorId?: number;
  departmentId?: number;
  departmentName?: string;
  field?: string;
  employer?: string;
  locationId?: number;
  locationName?: string;
}
```

**Update EditInternForm Interface:**
```typescript
interface EditInternForm {
  name: string;
  email: string;
  idNumber?: string;
  startDate?: string;
  endDate?: string;
  supervisor: string;
  // ... other fields
}
```

**Update Form Initialization (in openEditModal or similar method):**
```typescript
this.editInternForm.patchValue({
  name: intern.name || '',
  email: intern.email || '',
  idNumber: intern.idNumber || undefined,
  startDate: intern.startDate || undefined,
  endDate: intern.endDate || undefined,
  supervisor: intern.supervisor || '',
  // ... other fields
});
```

**Update New Intern Form Initialization:**
```typescript
this.editInternForm = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  idNumber: [undefined],
  startDate: [undefined],
  endDate: [undefined],
  supervisor: ['', Validators.required],
  // ... other fields
});
```

#### File: `src/app/admin/admin-dashboard/admin-dashboard.html`

**Update Table Headers:**
```html
<thead>
  <tr>
    <th>Name</th>
    <th>Email</th>
    <th>ID Number</th>
    <th>Start Date</th>
    <th>End Date</th>
    <th>Supervisor</th>
    <!-- other columns -->
  </tr>
</thead>
```

**Update Table Body:**
```html
<tbody>
  <tr *ngFor="let intern of filteredInterns">
    <td>{{ intern.name }}</td>
    <td><small class="text-muted">{{ intern.email }}</small></td>
    <td>{{ intern.idNumber || 'N/A' }}</td>
    <td>{{ intern.startDate ? (intern.startDate | date:'yyyy-MM-dd') : 'N/A' }}</td>
    <td>{{ intern.endDate ? (intern.endDate | date:'yyyy-MM-dd') : 'N/A' }}</td>
    <td>{{ intern.supervisorName || intern.supervisor || 'N/A' }}</td>
    <!-- other columns -->
  </tr>
  <tr *ngIf="filteredInterns.length === 0">
    <td colspan="11" class="text-center text-muted py-5">
      <!-- Update colspan to match total number of columns -->
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No interns found</p>
    </td>
  </tr>
</tbody>
```

**Update Edit Modal (if exists):**
```html
<div class="modal-body">
  <!-- Existing fields -->
  
  <div class="form-group">
    <label class="form-label">ID Number</label>
    <input type="text"
           class="form-control"
           [value]="editInternForm.idNumber || 'N/A'"
           name="editInternIdNumber"
           placeholder="ID Number"
           disabled>
    <small class="form-text text-muted">This field comes from sign-up and cannot be edited here</small>
  </div>

  <div class="form-group">
    <label class="form-label">Start Date</label>
    <input type="date"
           class="form-control"
           [value]="editInternForm.startDate || ''"
           name="editInternStartDate"
           placeholder="Start Date"
           disabled>
    <small class="form-text text-muted">This field comes from sign-up and cannot be edited here</small>
  </div>

  <div class="form-group">
    <label class="form-label">End Date</label>
    <input type="date"
           class="form-control"
           [value]="editInternForm.endDate || ''"
           name="editInternEndDate"
           placeholder="End Date"
           disabled>
    <small class="form-text text-muted">This field comes from sign-up and cannot be edited here</small>
  </div>
</div>
```

### 2. Supervisor Dashboard

#### File: `src/app/supervisor/supervisor-dashboard/supervisor-dashboard.ts`

**Update Intern Interface:**
```typescript
interface Intern {
  id?: number;
  internId?: number;
  name: string;
  email: string;
  idNumber?: string; // ID Number from sign-up
  startDate?: string; // Internship start date
  endDate?: string; // Internship end date
  supervisor: string;
  supervisorName?: string;
  supervisorId?: number;
  departmentId?: number;
  departmentName?: string;
  field?: string;
  employer?: string;
  locationId?: number;
  locationName?: string;
}
```

#### File: `src/app/supervisor/supervisor-dashboard/supervisor-dashboard.html`

**Update Table Headers:**
```html
<thead>
  <tr>
    <th>Name</th>
    <th>Email</th>
    <th>ID Number</th>
    <th>Start Date</th>
    <th>End Date</th>
    <th>Supervisor</th>
    <!-- other columns -->
  </tr>
</thead>
```

**Update Table Body:**
```html
<tbody>
  <tr *ngFor="let intern of filteredInterns">
    <td>{{ intern.name }}</td>
    <td><small class="text-muted">{{ intern.email }}</small></td>
    <td>{{ intern.idNumber || 'N/A' }}</td>
    <td>{{ intern.startDate ? (intern.startDate | date:'yyyy-MM-dd') : 'N/A' }}</td>
    <td>{{ intern.endDate ? (intern.endDate | date:'yyyy-MM-dd') : 'N/A' }}</td>
    <td>{{ intern.supervisorName || intern.supervisor || 'N/A' }}</td>
    <!-- other columns -->
  </tr>
  <tr *ngIf="filteredInterns.length === 0">
    <td colspan="10" class="text-center text-muted py-5">
      <!-- Update colspan to match total number of columns -->
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No interns found</p>
    </td>
  </tr>
</tbody>
```

### 3. Date Formatting Helper (Optional)

If you need consistent date formatting across components, add a helper method:

```typescript
formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch (e) {
    return 'N/A';
  }
}
```

Usage in template:
```html
<td>{{ formatDate(intern.startDate) }}</td>
<td>{{ formatDate(intern.endDate) }}</td>
```

### 4. Column Count Updates

Make sure to update `colspan` in empty state rows to match the total number of columns:

- **Admin Dashboard**: If you have 11 columns total, use `colspan="11"`
- **Supervisor Dashboard**: If you have 10 columns total, use `colspan="10"`

### 5. Data Display Format

- **ID Number**: Display as text, show "N/A" if not available
- **Start Date**: Format as `yyyy-MM-dd`, show "N/A" if not available
- **End Date**: Format as `yyyy-MM-dd`, show "N/A" if not available

### 6. Testing Checklist

- [ ] Admin dashboard displays ID Number column
- [ ] Admin dashboard displays Start Date column
- [ ] Admin dashboard displays End Date column
- [ ] Supervisor dashboard displays ID Number column
- [ ] Supervisor dashboard displays Start Date column
- [ ] Supervisor dashboard displays End Date column
- [ ] Empty state row colspan is correct
- [ ] Dates are formatted correctly
- [ ] "N/A" displays when data is missing
- [ ] Edit modal shows new fields (if applicable)
- [ ] Data loads correctly from backend API

## Notes

1. **Read-only Fields**: The ID Number, Start Date, and End Date fields come from the sign-up form and should typically be read-only in edit modals (disabled inputs).

2. **Date Handling**: The backend returns dates as `LocalDate` which will be serialized as strings in ISO format (YYYY-MM-DD). The frontend should handle these as strings.

3. **Optional Fields**: All three fields are optional, so always check for null/undefined before displaying.

4. **Backend Compatibility**: The backend already includes these fields in `InternResponse`, so no backend changes are needed.

## Files to Update

1. `src/app/admin/admin-dashboard/admin-dashboard.ts` - Update interfaces and form handling
2. `src/app/admin/admin-dashboard/admin-dashboard.html` - Update table columns and edit modal
3. `src/app/supervisor/supervisor-dashboard/supervisor-dashboard.ts` - Update interface
4. `src/app/supervisor/supervisor-dashboard/supervisor-dashboard.html` - Update table columns

## Additional Considerations

- If you have reports or export functionality that includes intern data, update those as well
- If you have any filtering or sorting functionality, consider adding these fields to filters
- If you have any charts or analytics displaying intern data, consider including these fields


