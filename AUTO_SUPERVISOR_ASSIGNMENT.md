# Automatic Supervisor Assignment for Interns

## ✅ Implementation Complete

Interns are now **automatically assigned to supervisors** based on their **department** and **field** when they register or are created.

---

## 🎯 How It Works

### **Assignment Logic:**

1. **If Field is Specified:**
   - System searches for supervisors in the same department
   - If a supervisor already supervises interns with the **same field**, the new intern is assigned to that supervisor
   - This groups interns by field under the same supervisor

2. **If Field Not Specified or No Matching Supervisor:**
   - Intern is assigned to the **first supervisor** in the department

3. **If No Supervisor Exists:**
   - System automatically creates a **default supervisor** for that department
   - Default supervisor name: `"Default Supervisor - {Department Name}"`
   - Default email: `supervisor@{department}.univen.ac.za`

---

## 📋 Where It's Applied

### **1. Registration Endpoint** (`POST /api/auth/register`)
When an intern registers through the sign-up form:
- Intern profile is automatically created
- Supervisor is automatically assigned based on department and field
- Field and employer are saved if provided

**Example Registration Request:**
```json
{
  "username": "john.doe@univen.ac.za",
  "verificationCode": "123456",
  "password": "SecurePass123!",
  "role": "intern",
  "name": "John",
  "surname": "Doe",
  "department": "ICT",
  "field": "Software Development",
  "employerName": "Tech Company"
}
```

**Result:**
- Intern is created in ICT department
- If a supervisor already supervises "Software Development" interns, John is assigned to that supervisor
- Otherwise, assigned to first ICT supervisor
- Field "Software Development" is saved

---

### **2. Admin Creates Intern** (`POST /api/interns`)
When admin creates an intern through the admin dashboard:
- If `supervisorId` is provided → uses that supervisor
- If `supervisorId` is **not provided** → auto-assigns based on department and field

**Example Request (with auto-assignment):**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@univen.ac.za",
  "departmentId": 1,
  "field": "Network Administration",
  "employer": "IT Solutions Inc"
  // supervisorId is NOT provided - will auto-assign
}
```

**Result:**
- Intern is created in department with ID 1
- System finds supervisor who already supervises "Network Administration" interns
- If found, assigns Jane to that supervisor
- Otherwise, assigns to first supervisor in department

---

## 🔍 Example Scenarios

### **Scenario 1: Field-Based Grouping**
- **Existing:** Supervisor A supervises 3 interns in "Software Development" field (ICT department)
- **New Intern:** Registers with field "Software Development" in ICT department
- **Result:** Assigned to Supervisor A (groups interns by field)

### **Scenario 2: First Supervisor Assignment**
- **Existing:** Supervisor B is the first supervisor in ICT department
- **New Intern:** Registers with field "Cybersecurity" (no existing interns with this field)
- **Result:** Assigned to Supervisor B (first supervisor in department)

### **Scenario 3: New Department**
- **Existing:** No supervisors in "Marketing" department
- **New Intern:** Registers in Marketing department
- **Result:** 
  - System creates "Default Supervisor - Marketing"
  - Intern is assigned to this default supervisor

---

## 📊 Supervisor Dashboard

Supervisors will see **only interns assigned to them** in their dashboard:

- Interns are filtered by `intern.supervisor.supervisorId == currentSupervisor.supervisorId`
- Each supervisor sees their own assigned interns
- Interns are grouped by field automatically through assignment logic

---

## 🔧 Technical Details

### **Files Modified:**

1. **`AuthController.java`**
   - Updated `createInternProfile()` method
   - Added `findAppropriateSupervisor()` helper method
   - Now saves `field` and `employer` during registration

2. **`InternService.java`**
   - Updated `createIntern()` method
   - Added auto-assignment logic when `supervisorId` is not provided
   - Added `findAppropriateSupervisor()` helper method

### **Assignment Algorithm:**

```java
1. Get all supervisors in the intern's department
2. If field is specified:
   a. Search for supervisor who already supervises interns with that field
   b. If found → assign to that supervisor
3. If no field match or field not specified:
   a. Assign to first supervisor in department
4. If no supervisor exists:
   a. Create default supervisor
   b. Assign intern to default supervisor
```

---

## ✅ Benefits

1. **Automatic Organization:** Interns are automatically grouped by field under appropriate supervisors
2. **No Manual Assignment:** Admins don't need to manually assign supervisors for every intern
3. **Consistent Grouping:** Interns with the same field are grouped together
4. **Department-Based:** Ensures interns are assigned to supervisors in their department
5. **Fallback Logic:** Always ensures an intern has a supervisor (creates default if needed)

---

## 🧪 Testing

### **Test 1: Field-Based Assignment**
1. Create Supervisor A in ICT department
2. Create Intern 1 with field "Software Development", assign to Supervisor A
3. Register Intern 2 with field "Software Development" in ICT
4. **Expected:** Intern 2 assigned to Supervisor A

### **Test 2: First Supervisor Assignment**
1. Create Supervisor B in ICT department
2. Register Intern 3 with field "Cybersecurity" in ICT
3. **Expected:** Intern 3 assigned to Supervisor B (first supervisor)

### **Test 3: Default Supervisor Creation**
1. Register Intern 4 in "Marketing" department (no supervisors exist)
2. **Expected:** 
   - Default supervisor created for Marketing
   - Intern 4 assigned to default supervisor

---

## 📝 Notes

- **Field Matching:** Uses case-insensitive comparison (`equalsIgnoreCase`)
- **Supervisor Priority:** If multiple supervisors have interns with the same field, assigns to the first one found
- **Default Supervisor:** Created automatically if no supervisor exists in department
- **Manual Override:** Admins can still manually assign supervisors by providing `supervisorId`

---

**Status:** ✅ **Fully Implemented and Tested**

All interns registered or created will now be automatically assigned to appropriate supervisors based on their department and field!

