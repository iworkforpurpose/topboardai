const express = require('express');
const router = express.Router();
const { createNewHire } = require('../controllers/employeeController');

// POST /api/new-hire - Create new employee
router.post('/new-hire', createNewHire);

module.exports = router;
