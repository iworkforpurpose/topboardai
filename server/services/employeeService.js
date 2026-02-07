const { bolticAPI, EMPLOYEES_TABLE_ID, WORKFLOW_WEBHOOK_URL } = require('../config/boltic');
const axios = require('axios');

/**
 * Create a new employee in Boltic Database
 */
async function createEmployee(employeeData) {
    try {
        const response = await bolticAPI.post(`/tables/${EMPLOYEES_TABLE_ID}/records`, {
            fields: {
                full_name: employeeData.full_name,
                email: employeeData.email,
                role: employeeData.role,
                start_date: employeeData.start_date,
                sync_status: 'pending',
                manager_id: employeeData.manager_id || null,
                token: null,
                token_expiry: null
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating employee in Boltic:', error.response?.data || error.message);
        throw new Error('Failed to create employee in database');
    }
}

/**
 * Trigger Boltic Welcome Workflow
 */
async function triggerWelcomeWorkflow(employeeData) {
    try {
        if (!WORKFLOW_WEBHOOK_URL) {
            console.warn('⚠️  Boltic workflow webhook URL not configured. Skipping workflow trigger.');
            return null;
        }

        const response = await axios.post(WORKFLOW_WEBHOOK_URL, {
            event: 'new_hire_created',
            employee: {
                id: employeeData.id,
                full_name: employeeData.full_name,
                email: employeeData.email,
                role: employeeData.role,
                start_date: employeeData.start_date
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error triggering Boltic workflow:', error.response?.data || error.message);
        // Don't throw error - workflow trigger is non-critical
        return null;
    }
}

module.exports = {
    createEmployee,
    triggerWelcomeWorkflow
};
