# HR Create New Hire Flow - Setup Guide

## ✅ What's Been Implemented

### Backend (`/server`)
- ✅ **POST /api/new-hire** endpoint
- ✅ Employee creation in Boltic database
- ✅ Boltic workflow trigger integration
- ✅ Input validation (name, email, role, start_date)
- ✅ Error handling

### Frontend (`/client`)
- ✅ Beautiful HR form with premium design
- ✅ Form validation
- ✅ Loading states
- ✅ Success/error messages
- ✅ Role dropdown
- ✅ Date picker with min date validation

---

## 🔧 Setup Instructions

### 1. Configure Boltic Credentials

Edit `/server/.env` and add your Boltic credentials:

```bash
BOLTIC_API_KEY=your_actual_api_key_here
BOLTIC_EMPLOYEES_TABLE_ID=your_employees_table_id
BOLTIC_TASKS_TABLE_ID=your_tasks_table_id
BOLTIC_WORKFLOW_WEBHOOK_URL=your_workflow_webhook_url
```

**To get these values:**
1. Log in to your Boltic dashboard
2. Navigate to your database tables
3. Copy the Table IDs for `employees` and `onboarding_tasks`
4. Create a workflow webhook and copy the webhook URL

### 2. Update Boltic API Integration

The backend is currently configured for a generic REST API structure. You may need to update `/server/services/employeeService.js` based on Boltic's actual API format.

**Current structure:**
```javascript
POST /tables/{tableId}/records
Body: { fields: { ... } }
```

If Boltic uses a different API format, update the `createEmployee` function accordingly.

---

## 🚀 Running the Application

### Start Backend
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:5000`

### Start Frontend
```bash
cd client
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 📝 API Endpoint

### POST /api/new-hire

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john.doe@company.com",
  "role": "Software Engineer",
  "start_date": "2026-03-01",
  "manager_id": null
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "New hire created successfully",
  "data": {
    "id": "emp_123",
    "full_name": "John Doe",
    "email": "john.doe@company.com",
    "role": "Software Engineer",
    "start_date": "2026-03-01"
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🧪 Testing the Flow

### 1. Test Backend Endpoint Directly

```bash
curl -X POST http://localhost:5000/api/new-hire \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "role": "Software Engineer",
    "start_date": "2026-03-01"
  }'
```

### 2. Test Frontend Form

1. Open browser to `http://localhost:5173`
2. Fill in the form:
   - Full Name: "Jane Smith"
   - Email: "jane.smith@company.com"
   - Role: Select from dropdown
   - Start Date: Pick a future date
3. Click "Create New Hire"
4. Look for success message

### 3. Verify in Boltic

1. Go to your Boltic dashboard
2. Navigate to the `employees` table
3. Check if the new record was created
4. Verify the workflow was triggered (check workflow logs)

---

## 🎨 Frontend Features

- **Gradient background** with modern aesthetics
- **Form validation** for all required fields
- **Email format validation**
- **Date picker** with minimum date (today)
- **Loading spinner** during submission
- **Success/error messages** with color-coded alerts
- **Auto-reset form** on successful submission
- **Info box** explaining what happens after creation

---

## 📂 File Structure

```
server/
├── config/
│   └── boltic.js              # Boltic API configuration
├── controllers/
│   └── employeeController.js  # New hire creation logic
├── routes/
│   └── employeeRoutes.js      # API routes
├── services/
│   └── employeeService.js     # Boltic integration
├── index.js                   # Main server file
└── .env                       # Environment variables

client/
├── src/
│   ├── components/
│   │   └── NewHireForm.tsx    # HR form component
│   ├── services/
│   │   └── api.ts             # API service
│   └── App.tsx                # Main app
└── .env                       # Frontend config
```

---

## 🔄 Workflow Trigger

When a new hire is created:
1. ✅ Employee saved to Boltic `employees` table
2. ✅ Workflow webhook triggered with employee data
3. 🔄 **Boltic workflow should:**
   - Generate login token
   - Send welcome email on start date
   - Create onboarding tasks

**Note:** Make sure your Boltic workflow is configured to listen to the webhook URL.

---

## 🐛 Troubleshooting

### Backend not connecting to Boltic
- Verify API key in `.env`
- Check if Boltic API URL is correct
- Look at server console for error messages

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check CORS settings (already enabled)
- Verify `VITE_API_URL` in client `.env`

### Workflow not triggering
- Check if `BOLTIC_WORKFLOW_WEBHOOK_URL` is set
- Verify webhook URL in Boltic dashboard
- Check server logs for workflow trigger confirmation

---

## ✅ Next Steps

Once this is working, you can proceed to:
- View all employees dashboard
- Token generation system
- Onboarding tasks management
- Progress tracking

---

**Created:** 2026-02-06
**Status:** ✅ Ready for testing
