# API Endpoints Structure

## Overview
The API is now organized by feature/role for better maintainability and clarity.

## Endpoints by Feature

### 🔐 Authentication (`/api/auth`)
Used for employee onboarding token verification.

| Method | Endpoint | Description | Used By |
|--------|----------|-------------|---------|
| POST | `/api/auth/verify-token` | Verify employee onboarding token | Employee Dashboard |

**Request Body:**
```json
{
  "token": "64-character-hex-string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "Engineering",
    "startDate": "2026-02-07"
  }
}
```

---

### 👔 HR Admin (`/api/hr`)
Used by HR Admin dashboard for employee management.

| Method | Endpoint | Description | Used By |
|--------|----------|-------------|---------|
| GET | `/api/hr/employees` | Get all employees | HR Dashboard |
| POST | `/api/hr/new-hire` | Create new employee | HR Dashboard |

**POST `/api/hr/new-hire` Request Body:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "role": "Engineering",
  "start_date": "2026-02-15",
  "manager_id": "m1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New hire created successfully",
  "data": {
    "id": "uuid",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "role": "Engineering",
    "start_date": "2026-02-15"
  }
}
```

---

### 👥 Manager (`/api/manager`)
Used by Manager dashboard for team management.

| Method | Endpoint | Description | Used By |
|--------|----------|-------------|---------|
| GET | `/api/manager/team` | Get team members | Manager Dashboard |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "Engineering",
      "startDate": "2026-02-07",
      "status": "ON_TRACK",
      "progress": 45
    }
  ]
}
```

---

## Legacy Endpoints (Backward Compatibility)

For backward compatibility, the following legacy endpoints are still available:

- `POST /api/verify-token` → Use `/api/auth/verify-token` instead
- `GET /api/employees` → Use `/api/hr/employees` or `/api/manager/team` instead
- `POST /api/new-hire` → Use `/api/hr/new-hire` instead

---

## File Structure

```
server/
├── index.js                    # Main server file with route mounting
├── routes/
│   ├── authRoutes.js          # Authentication endpoints
│   ├── hrRoutes.js            # HR Admin endpoints
│   ├── managerRoutes.js       # Manager endpoints
│   └── employeeRoutes.js      # Legacy endpoints (deprecated)
├── controllers/
│   └── employeeController.js  # Request handlers
└── services/
    └── employeeService.js     # Business logic & Boltic integration
```

---

## Frontend Integration

### HR Dashboard
```javascript
// Fetch employees
fetch('http://localhost:5000/api/hr/employees')

// Create new employee
fetch('http://localhost:5000/api/hr/new-hire', {
  method: 'POST',
  body: JSON.stringify({ full_name, email, role, start_date, manager_id })
})
```

### Employee Dashboard
```javascript
// Verify token
fetch('http://localhost:5000/api/auth/verify-token', {
  method: 'POST',
  body: JSON.stringify({ token })
})
```

### Manager Dashboard
```javascript
// Get team members
fetch('http://localhost:5000/api/manager/team')
```

---

## Benefits of New Structure

✅ **Clear Separation**: Each role has its own API namespace  
✅ **Better Security**: Easier to add role-based authentication later  
✅ **Maintainability**: Easy to find and update role-specific endpoints  
✅ **Scalability**: Add new features without cluttering existing routes  
✅ **Documentation**: Clear API structure for team collaboration
