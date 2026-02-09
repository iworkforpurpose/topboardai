const express = require('express');
const router = express.Router();
const { getEmployees } = require('../controllers/employeeController');

// GET /api/manager/team - Get team members for manager dashboard
router.get('/team', getEmployees);

module.exports = router;
