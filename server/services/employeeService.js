const { bolticClient, EMPLOYEES_TABLE_NAME, WORKFLOW_WEBHOOK_URL } = require('../config/boltic');
const axios = require('axios');
const crypto = require('crypto');

/**
 * Generate a unique onboarding token
 */
function generateOnboardingToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new employee in Boltic Database
 */
async function createEmployee(employeeData) {
    try {
        const newEmployee = {
            full_name: employeeData.full_name,
            personal_email: employeeData.email,
            role: employeeData.role,
            start_date: employeeData.start_date,
            token: generateOnboardingToken(),
            token_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        console.log('🔄 Creating employee with data:', JSON.stringify(newEmployee, null, 2));

        const { data: record, error } = await bolticClient.records.insert(EMPLOYEES_TABLE_NAME, newEmployee);

        if (error) {
            console.error('❌ Boltic insert failed:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            throw new Error(error.message || 'Failed to insert record');
        }

        console.log('✅ Employee record created:', record.id);
        console.log('🔑 Onboarding token:', newEmployee.token);
        console.log('📧 Email in record:', record.personal_email || 'NOT FOUND');
        console.log('📋 Full record:', JSON.stringify(record, null, 2));
        return record;
    } catch (error) {
        console.error('Error creating employee in Boltic:', error.message);
        throw new Error('Failed to create employee in database');
    }
}

/**
 * Trigger Boltic Welcome Workflow
 * Note: If using Database Trigger in Boltic, this function is optional
 * The workflow will automatically trigger on new record insertion
 */
async function triggerWelcomeWorkflow(employeeData) {
    try {
        if (!WORKFLOW_WEBHOOK_URL || WORKFLOW_WEBHOOK_URL === 'your_workflow_webhook_url') {
            console.log('ℹ️  Workflow webhook not configured. Using Database Trigger instead.');
            console.log('💡 Boltic workflow will auto-trigger on database insert if Database Trigger is set up.');
            return null;
        }

        console.log('🔔 Triggering Boltic workflow for:', employeeData.full_name);
        
        // Send data in Boltic-compatible format
        const payload = {
            record_id: employeeData.id,
            full_name: employeeData.full_name,
            personal_email: employeeData.email,
            role: employeeData.role,
            start_date: employeeData.start_date,
            trigger_event: 'new_hire_created',
            timestamp: new Date().toISOString()
        };

        console.log('📤 Workflow payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(WORKFLOW_WEBHOOK_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });

        console.log('✅ Workflow triggered successfully:', response.status);
        return response.data;
    } catch (error) {
        console.error('⚠️  Workflow trigger failed:', error.response?.data || error.message);
        // Don't throw error - workflow trigger is non-critical
        return null;
    }
}

/**
 * Get all employees from Boltic Database
 */
async function getAllEmployees() {
    try {
        console.log('📊 Fetching employees from Boltic table:', EMPLOYEES_TABLE_NAME);
        
        // Use Boltic SDK to fetch all records from the table
        const { data: records, error } = await bolticClient.records.findAll(EMPLOYEES_TABLE_NAME);

        if (error) {
            console.error('❌ Boltic fetch failed:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            throw new Error(error.message || 'Unknown Boltic error');
        }

        console.log('✅ Successfully fetched', records?.length || 0, 'employees from Boltic');
        
        // Transform Boltic records to match our Employee interface
        const employees = (records || []).map(record => ({
            id: record.id || record._id,
            fullName: record.full_name || record.fullName || '',
            email: record.personal_email || record.email || '',
            role: record.role || '',
            startDate: record.start_date || record.startDate || '',
            status: record.status || 'pending',
            progress: record.progress || 0
        }));

        return employees;
    } catch (error) {
        console.error('❌ Error fetching employees from Boltic:', error.message);
        // Return empty array to prevent frontend crashes
        return [];
    }
}

/**
 * Update employee record in Boltic Database
 */
async function updateEmployee(employeeId, updates) {
    try {
        const { data: record, error } = await bolticClient.records.updateById(
            EMPLOYEES_TABLE_NAME,
            employeeId,
            updates
        );

        if (error) {
            console.error('❌ Boltic update failed:', error.message);
            throw new Error(error.message);
        }

        console.log('✅ Employee record updated:', employeeId);
        return record;
    } catch (error) {
        console.error('Error updating employee in Boltic:', error.message);
        throw new Error('Failed to update employee in database');
    }
}

/**
 * Verify employee token and return employee data
 */
async function verifyToken(token) {
    try {
        console.log('🔍 Verifying token:', token.substring(0, 10) + '...');
        
        const { data: records, error } = await bolticClient.records.findAll(EMPLOYEES_TABLE_NAME);

        if (error) {
            console.error('❌ Boltic fetch failed:', error);
            throw new Error('Failed to verify token');
        }

        // Find employee by token
        const employee = records?.find(record => record.token === token);

        if (!employee) {
            console.log('❌ Token not found in database');
            return null;
        }

        // Check if token is expired
        const tokenExpiry = new Date(employee.token_expiry);
        const now = new Date();

        if (tokenExpiry < now) {
            console.log('❌ Token expired:', tokenExpiry);
            return { expired: true };
        }

        console.log('✅ Token verified for employee:', employee.full_name);
        
        return {
            id: employee.id,
            fullName: employee.full_name,
            email: employee.personal_email || employee.email || '',
            role: employee.role,
            startDate: employee.start_date
        };
    } catch (error) {
        console.error('❌ Error verifying token:', error.message);
        throw error;
    }
}

module.exports = {
    createEmployee,
    triggerWelcomeWorkflow,
    getAllEmployees,
    updateEmployee,
    verifyToken
};
