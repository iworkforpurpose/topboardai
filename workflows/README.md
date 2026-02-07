# Boltic Workflows

This directory will contain documentation, screenshots, and configuration files for Boltic workflows.

## Planned Workflows

### 1. Welcome Email Workflow (Day 0)
- **Trigger:** Cron (10 AM daily)
- **Steps:**
  1. Query DB for employees starting today
  2. Generate token (call your API)
  3. Send email with webapp link + credentials

### 2. Progress Monitoring
- **Trigger:** Cron (Every 6 hours)
- **Steps:**
  1. Query your API for stuck employees
  2. If task incomplete > 12 hours → send reminder
  3. If still stuck after 24h → notify HR

### 3. Completion Celebration
- **Trigger:** Webhook from your app
- **Steps:**
  1. Send congrats email to employee
  2. Notify manager on Slack
  3. Update HR dashboard

### 4. AI Agent: Onboarding FAQ Chatbot
- **Knowledge Base:**
  - Company handbook (uploaded docs)
  - WiFi password, salary dates, policies
  - Office locations, team contacts
- **Integration:** API endpoint for your webapp

## Setup Instructions

To be added as workflows are configured in the Boltic platform.
