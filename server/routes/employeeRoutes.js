const express = require('express');
const router = express.Router();
const { createNewHire, getEmployees, verifyEmployeeToken } = require('../controllers/employeeController');

// GET /api/employees - Get all employees
router.get('/employees', getEmployees);

// POST /api/new-hire - Create new employee
router.post('/new-hire', createNewHire);

// POST /api/verify-token - Verify employee token
router.post('/verify-token', verifyEmployeeToken);

module.exports = router;
