# Onboarding Automation System

An automated employee onboarding platform powered by Boltic workflows and AI agents.

## 🏗️ Architecture

This system consists of three main components:

- **React Web App** - Token-based dashboards for new hires, HR, and managers
- **Node.js Backend** - REST API with Boltic integration
- **Boltic Platform** - Workflows for automation and AI agent for support

## 📁 Project Structure

```
root/
├── client/          # React + Tailwind frontend
├── server/          # Node.js + Express backend
├── workflows/       # Boltic documentation and configurations
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Boltic account with API credentials

### Installation

**1. Clone the repository**

```bash
cd Topboardai
```

**2. Setup Backend**

```bash
cd server
npm install
```

Create a `.env` file and add your Boltic credentials:

```env
PORT=5000
NODE_ENV=development
BOLTIC_API_KEY=your_api_key_here
BOLTIC_WORKSPACE_ID=your_workspace_id
```

**3. Setup Frontend**

```bash
cd ../client
npm install
```

### Running Locally

**Start Backend (Terminal 1):**

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

**Start Frontend (Terminal 2):**

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📋 Phase 1 - Core New-Hire Auto-Sync

### Goal
HR creates new hire → system auto-syncs → onboarding tasks created → welcome email sent

### Features
- [ ] New hire creation via HR dashboard
- [ ] Automatic onboarding task generation
- [ ] Boltic workflow integration
- [ ] Welcome email automation

## 🔗 Boltic Integration

All automation workflows are managed through the Boltic platform:

1. **Welcome Email Workflow** - Triggered on new hire creation
2. **Progress Monitoring** - Checks task completion status
3. **Completion Celebration** - Sends congratulations on completion
4. **AI FAQ Chatbot** - Answers onboarding questions

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express
- Boltic Tables (Database)

### Automation
- Boltic Workflows
- Boltic AI Agent

## 📝 API Endpoints (Planned)

```
POST   /api/new-hire              # Create new hire + trigger Boltic
POST   /api/auth/token            # Verify token
GET    /api/tasks/:employeeId     # Get onboarding tasks
PUT    /api/tasks/:id/complete    # Mark task complete
PUT    /api/extend-access/:id     # Extend token access
POST   /webhooks/boltic           # Receive Boltic notifications
```

## 🗄️ Database Schema (Planned)

### employees
- id, name, email, role, start_date
- token, token_expiry, manager_id

### onboarding_tasks
- id, employee_id, title, day
- link, completed, completed_at

### progress_logs
- employee_id, timestamp, action

## 📦 Development Status

✅ **Step 1: Project Structure Setup** - Complete
- React app with Tailwind CSS
- Express backend with basic server
- Environment configuration

🔄 **Next Steps:**
- Waiting for further instructions...

## 🤝 Contributing

This project is built incrementally. Each phase will be implemented step-by-step based on requirements.

## 📄 License

ISC
