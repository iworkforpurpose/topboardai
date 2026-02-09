const express = require('express');
const router = express.Router();
const { verifyEmployeeToken } = require('../controllers/employeeController');
const { adminLogin, addHrAdmin, verifyAdminToken } = require('../controllers/authController');

// POST /api/auth/verify-token - Verify employee onboarding token
router.post('/verify-token', verifyEmployeeToken);

// POST /api/auth/admin-login - HR/Manager authentication
router.post('/admin-login', adminLogin);

// POST /api/auth/admin-verify - verify admin JWT
router.post('/admin-verify', verifyAdminToken);

// POST /api/auth/add-hr - Manager adds HR account
router.post('/add-hr', addHrAdmin);

module.exports = router;
