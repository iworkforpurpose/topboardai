const axios = require('axios');

// Boltic API Configuration
const BOLTIC_BASE_URL = process.env.BOLTIC_API_URL || 'https://api.boltic.io/v1';
const BOLTIC_API_KEY = process.env.BOLTIC_API_KEY;
const EMPLOYEES_TABLE_ID = process.env.BOLTIC_EMPLOYEES_TABLE_ID;
const TASKS_TABLE_ID = process.env.BOLTIC_TASKS_TABLE_ID;
const WORKFLOW_WEBHOOK_URL = process.env.BOLTIC_WORKFLOW_WEBHOOK_URL;

// Create axios instance with Boltic config
const bolticAPI = axios.create({
    baseURL: BOLTIC_BASE_URL,
    headers: {
        'Authorization': `Bearer ${BOLTIC_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

module.exports = {
    bolticAPI,
    EMPLOYEES_TABLE_ID,
    TASKS_TABLE_ID,
    WORKFLOW_WEBHOOK_URL
};
