# Boltic Database Integration Setup

## Overview
The HR Dashboard now fetches real-time employee data from your Boltic database table.

## Setup Instructions

### 1. Configure Environment Variables

Edit `server/.env` and add your Boltic New Hires table ID:

```env
BOLTIC_EMPLOYEES_TABLE_ID=your-table-id-here
```

### 2. Required Table Fields

Your Boltic "New Hires" table should have the following fields:

**Required Fields:**
- `full_name` (Text) - Employee's full name
- `email` (Email) - Employee email address
- `start_date` (Date) - Start date
- `role` (Text) - Department/Role

**Optional Fields (for enhanced functionality):**
- `department` (Text) - Department name
- `role_type` (Select: TECH/NON_TECH) - Role type
- `status` (Select: NOT_STARTED/ON_TRACK/STUCK/COMPLETED) - Onboarding status
- `progress` (Number) - Progress percentage (0-100)
- `avatar_url` (URL) - Profile picture URL
- `manager_id` (Text) - Manager's ID
- `token_expiry` (DateTime) - Access token expiry
- `email_created` (Checkbox) - Email provisioned
- `slack_invited` (Checkbox) - Slack invite sent
- `hris_record` (Checkbox) - HRIS record created
- `equipment_ordered` (Checkbox) - Equipment ordered

### 3. API Endpoints

**Backend (Port 5000):**
- `GET /api/employees` - Fetch all employees
- `POST /api/new-hire` - Create new employee

**Request Body for POST /api/new-hire:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "Engineering",
  "start_date": "2026-02-10",
  "manager_id": "m1"
}
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

### 5. Features

✅ Real-time employee data from Boltic database
✅ Auto-refresh on new hire creation
✅ Loading states and error handling
✅ Animated automation workflow visualization
✅ Sync status indicators

## Testing

1. Open HR Dashboard at `http://localhost:5173`
2. Click "Auto-Onboard New Hire"
3. Fill in employee details
4. Watch the automation steps execute
5. New employee appears in the table from Boltic DB

## Troubleshooting

**Issue: "Failed to fetch employees"**
- Check that `BOLTIC_EMPLOYEES_TABLE_ID` is set in `.env`
- Verify Boltic API key is valid
- Ensure table exists in your Boltic workspace

**Issue: CORS errors**
- Server runs on port 5000 with CORS enabled
- Frontend on port 5173 (Vite default)
- Check both servers are running

**Issue: Empty table**
- Check Boltic table has records
- Verify field names match the mapping in `HRDashboard.tsx`
- Check browser console for API errors
