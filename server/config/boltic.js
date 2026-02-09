require('dotenv').config();
const { createClient } = require('@boltic/sdk');

// Boltic API Configuration
const BOLTIC_API_KEY = process.env.BOLTIC_API_KEY;
const EMPLOYEES_TABLE_NAME = process.env.BOLTIC_EMPLOYEES_TABLE_NAME || 'New-hires';
const TASKS_TABLE_NAME = process.env.BOLTIC_TASKS_TABLE_NAME;
const WORKFLOW_WEBHOOK_URL = process.env.BOLTIC_WORKFLOW_WEBHOOK_URL;

// Create Boltic client instance with PAT token
const bolticClient = createClient(BOLTIC_API_KEY);

module.exports = {
    bolticClient,
    EMPLOYEES_TABLE_NAME,
    TASKS_TABLE_NAME,
    WORKFLOW_WEBHOOK_URL
};
