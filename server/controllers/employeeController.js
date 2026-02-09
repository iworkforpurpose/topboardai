const { createEmployee, triggerWelcomeWorkflow, getAllEmployees, updateEmployee } = require('../services/employeeService');

/**
 * GET /api/employees
 * Get all employees
 */
async function getEmployees(req, res) {
    try {
        const employees = await getAllEmployees();
        
        res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        console.error('Error in getEmployees:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch employees'
        });
    }
}

/**
 * POST /api/new-hire
 * Create a new hire and trigger onboarding workflow
 */
async function createNewHire(req, res) {
    try {
        const { full_name, email, role, start_date, manager_id } = req.body;

        // Validation
        if (!full_name || !email || !role || !start_date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: full_name, email, role, start_date'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Create employee in Boltic database
        const employee = await createEmployee({
            full_name,
            email,
            role,
            start_date,
            manager_id
        });

        console.log('✅ Employee created:', employee);

        // Trigger Boltic welcome workflow (non-blocking)
        triggerWelcomeWorkflow({
            id: employee.id,
            full_name,
            email,
            role,
            start_date
        }).then(() => {
            console.log('✅ Welcome workflow triggered for:', email);
        }).catch((err) => {
            console.error('⚠️  Workflow trigger failed:', err.message);
        });

        // Return success response
        res.status(201).json({
            success: true,
            message: 'New hire created successfully',
            data: {
                id: employee.id,
                full_name,
                email,
                role,
                start_date
            }
        });

    } catch (error) {
        console.error('Error in createNewHire:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create new hire'
        });
    }
}

/**
 * POST /api/verify-token
 * Verify employee onboarding token
 */
async function verifyEmployeeToken(req, res) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        const { verifyToken } = require('../services/employeeService');
        const employee = await verifyToken(token);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Invalid token. Please check your email for the correct token.'
            });
        }

        if (employee.expired) {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please contact HR for a new token.'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Error in verifyEmployeeToken:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify token'
        });
    }
}

module.exports = {
    createNewHire,
    getEmployees,
    verifyEmployeeToken
};
