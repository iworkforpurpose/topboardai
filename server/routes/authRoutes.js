const express = require('express');
const router = express.Router();
const { verifyEmployeeToken } = require('../controllers/employeeController');
const { adminLogin, addHrAdmin, verifyAdminToken, consumeInvite } = require('../controllers/authController');

// POST /api/auth/verify-token - Verify employee onboarding token
router.post('/verify-token', verifyEmployeeToken);

// POST /api/auth/admin-login - HR/Manager authentication
router.post('/admin-login', adminLogin);

// POST /api/auth/admin-verify - verify admin JWT
router.post('/admin-verify', verifyAdminToken);

// POST /api/auth/add-hr - Manager adds HR account
router.post('/add-hr', addHrAdmin);

// POST /api/auth/consume-invite - HR accepts invite and gets temp password
router.post('/consume-invite', consumeInvite);

module.exports = router;
