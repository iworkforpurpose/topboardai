const express = require('express');
const router = express.Router();
const { createNewHire, getEmployees } = require('../controllers/employeeController');

// GET /api/hr/employees - Get all employees for HR dashboard
router.get('/employees', getEmployees);

// POST /api/hr/new-hire - Create new employee
router.post('/new-hire', createNewHire);

module.exports = router;
