const jwt = require('jsonwebtoken');
const { authenticateAdmin, createAdmin, issueHrInvite, consumeInviteToken } = require('../services/adminAuthService');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev_admin_secret';

async function adminLogin(req, res) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required' });
    }
    console.log('[authController] login attempt', { email, role });
    const admin = await authenticateAdmin({ email, password, role });
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ success: true, data: admin, token });
  } catch (err) {
    const message = err.message || 'Authentication failed';
    const status = message === 'Invalid credentials' || message === 'Invalid role' ? 401 : 500;
    console.error('[authController] login failed', { error: message, stack: err.stack });
    return res.status(status).json({ success: false, message });
  }
}

async function verifyAdminToken(req, res) {
  try {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = req.body.token || bearerToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing token' });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ success: true, data: payload });
  } catch (err) {
    const message = err.message || 'Token verification failed';
    console.error('[authController] verify token failed', { error: message });
    return res.status(401).json({ success: false, message });
  }
}

async function addHrAdmin(req, res) {
  try {
    const { email, fullName } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ success: false, message: 'Email and fullName are required' });
    }
    const invite = await issueHrInvite({ email, fullName, role: 'HR Admin' });
    return res.status(201).json({ success: true, data: invite });
  } catch (err) {
    const message = err.message || 'Failed to create HR admin';
    const status = message.includes('already exists') ? 409 : 500;
    console.error('[authController] addHrAdmin failed', { message, stack: err.stack });
    return res.status(status).json({ success: false, message });
  }
}

async function consumeInvite(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Invite token is required' });
    }
    const result = await consumeInviteToken(token);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    const message = err.message || 'Invalid or expired invite token';
    const status = message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid') ? 401 : 500;
    console.error('[authController] consumeInvite failed', { message, stack: err.stack });
    return res.status(status).json({ success: false, message });
  }
}

module.exports = { adminLogin };
module.exports.addHrAdmin = addHrAdmin;
module.exports.verifyAdminToken = verifyAdminToken;
module.exports.consumeInvite = consumeInvite;
