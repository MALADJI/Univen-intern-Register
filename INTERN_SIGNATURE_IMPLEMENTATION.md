# Intern Signature Implementation Guide

## Overview
This document describes the implementation of signature storage for interns using LONGBLOB in MySQL.

## Database Schema

### Intern Entity
- **Field**: `signature` (byte[])
- **Database Type**: `LONGBLOB`
- **Nullable**: Yes
- **Purpose**: Store signature images as binary data

## Backend Implementation

### 1. Entity Update (`Intern.java`)
```java
@Lob
@Column(columnDefinition = "LONGBLOB")
private byte[] signature;
```

### 2. API Endpoints

#### Save Signature
**Endpoint**: `PUT /api/interns/{id}/signature`

**Request Body**:
```json
{
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response** (Success):
```json
{
  "message": "Signature saved successfully",
  "hasSignature": true,
  "size": 12345
}
```

**Response** (Error):
```json
{
  "error": "Intern not found"
}
```

#### Get Signature (Base64)
**Endpoint**: `GET /api/interns/{id}/signature`

**Response** (Has Signature):
```json
{
  "hasSignature": true,
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response** (No Signature):
```json
{
  "hasSignature": false,
  "signature": ""
}
```

#### Get Signature (Binary Image)
**Endpoint**: `GET /api/interns/{id}/signature/image`

**Response**: 
- **Content-Type**: `image/png`
- **Body**: Raw PNG image bytes
- **Use Case**: Direct image display in `<img>` tags

**Example Frontend Usage**:
```html
<img [src]="'http://localhost:8082/api/interns/' + internId + '/signature/image'" />
```

## Frontend Implementation

### 1. Capture Signature (Signature Pad Example)
```typescript
// Using signature_pad library
import SignaturePad from 'signature_pad';

const canvas = document.getElementById('signature-pad') as HTMLCanvasElement;
const signaturePad = new SignaturePad(canvas);

// Get signature as Base64
const signature = signaturePad.toDataURL(); // Returns: "data:image/png;base64,..."
```

### 2. Save Signature to Backend
```typescript
saveSignature(internId: number, signatureBase64: string): Observable<any> {
  return this.http.put(
    `${API_URL}/interns/${internId}/signature`,
    { signature: signatureBase64 }
  );
}
```

### 3. Retrieve Signature
```typescript
getSignature(internId: number): Observable<any> {
  return this.http.get(`${API_URL}/interns/${internId}/signature`);
}

// Or get as binary image
getSignatureImage(internId: number): Observable<Blob> {
  return this.http.get(
    `${API_URL}/interns/${internId}/signature/image`,
    { responseType: 'blob' }
  );
}
```

### 4. Display Signature
```typescript
// Option 1: Using Base64 string
this.getSignature(internId).subscribe(response => {
  if (response.hasSignature) {
    this.signatureImage = response.signature; // Already includes "data:image/png;base64,"
  }
});

// In HTML:
<img [src]="signatureImage" />

// Option 2: Using binary image endpoint
this.getSignatureImage(internId).subscribe(blob => {
  const url = URL.createObjectURL(blob);
  this.signatureImage = url;
});

// In HTML:
<img [src]="signatureImage" />
```

## Database Migration

### Run SQL Script
Execute `ADD_INTERN_SIGNATURE_COLUMN.sql` in your MySQL database:

```bash
mysql -u your_username -p internregister < ADD_INTERN_SIGNATURE_COLUMN.sql
```

Or run it directly in MySQL Workbench/phpMyAdmin.

### Verify Migration
```sql
DESCRIBE interns;
-- Should show 'signature' column with type 'longblob'
```

## Data Flow

1. **Frontend**: User draws signature on canvas → Convert to Base64
2. **Frontend**: Send Base64 string to backend (`PUT /api/interns/{id}/signature`)
3. **Backend**: Remove data URL prefix (if present) → Decode Base64 → Convert to byte[]
4. **Backend**: Save byte[] to MySQL LONGBLOB column
5. **Retrieval**: Backend reads byte[] → Encode to Base64 → Return to frontend
6. **Frontend**: Display signature using Base64 data URL or binary image endpoint

## Benefits

✅ **Efficient Storage**: LONGBLOB stores binary data efficiently
✅ **Permanent Storage**: Signatures are stored forever in the database
✅ **Easy Retrieval**: Simple endpoints to get signatures
✅ **Flexible Display**: Can return Base64 string or binary image
✅ **Small Size**: Signatures are typically 5-50 KB

## Security Considerations

- ✅ Endpoints require authentication (via JWT)
- ✅ Interns can only update their own signature (add authorization check if needed)
- ✅ Base64 validation prevents invalid data
- ✅ Size limits can be added if needed (e.g., max 100 KB)

## Example Usage

### Complete Flow
```typescript
// 1. Capture signature
const signature = signaturePad.toDataURL();

// 2. Save to backend
this.internService.saveSignature(internId, signature).subscribe({
  next: (response) => {
    console.log('Signature saved:', response);
  },
  error: (error) => {
    console.error('Failed to save signature:', error);
  }
});

// 3. Load signature on page load
this.internService.getSignature(internId).subscribe({
  next: (response) => {
    if (response.hasSignature) {
      this.signatureImage = response.signature;
      signaturePad.fromDataURL(response.signature);
    }
  }
});
```

## Testing

### Test Save Signature
```bash
curl -X PUT http://localhost:8082/api/interns/1/signature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

### Test Get Signature
```bash
curl -X GET http://localhost:8082/api/interns/1/signature \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Get Signature Image
```bash
curl -X GET http://localhost:8082/api/interns/1/signature/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output signature.png
```

