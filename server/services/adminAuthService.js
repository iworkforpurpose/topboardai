const crypto = require('crypto');
const { bolticClient } = require('../config/boltic');

const ADMINS_TABLE = process.env.BOLTIC_ADMINS_TABLE_NAME || 'Admins';
const AUTH_SALT = process.env.ADMIN_AUTH_SALT || 'change_me';

function hashPassword(password) {
  return crypto.createHash('sha256').update(AUTH_SALT + password).digest('hex');
}

async function findAdminByEmail(email) {
  const { data: records, error } = await bolticClient.records.findAll(ADMINS_TABLE);
  if (error) {
    throw new Error(error.message || 'Failed to fetch admins');
  }
  return (records || []).find((r) => (r.email || '').toLowerCase() === email.toLowerCase());
}

async function authenticateAdmin({ email, password, role }) {
  if (!email || !password || !role) {
    throw new Error('Email, password, and role are required');
  }
  console.log('[auth] lookup start', { table: ADMINS_TABLE, email, role });
  const admin = await findAdminByEmail(email);
  if (!admin) {
    console.warn('[auth] admin not found', { table: ADMINS_TABLE, email, role });
    throw new Error('Invalid credentials');
  }
  const expectedHash = admin.password_hash || admin.passwordHash;
  const expectedPlain = admin.password || admin.password_plain || admin.passwordPlain;

  // Accept either hashed or plaintext password (to support current non-hashed records)
  const incomingHash = hashPassword(password);
  const matchesHash = expectedHash ? incomingHash === expectedHash : false;
  const matchesPlain = expectedPlain ? password === expectedPlain : false;
  const matchesHashAsPlain = expectedHash ? password === expectedHash : false; // fallback if table stored plaintext in hash column

  if (!matchesHash && !matchesPlain && !matchesHashAsPlain) {
    console.warn('[auth] password mismatch', { email, role, hasHash: !!expectedHash, hasPlain: !!expectedPlain });
    throw new Error('Invalid credentials');
  }
  const adminRole = String(admin.role || '').toUpperCase();
  const requestedRole = String(role || '').toUpperCase();
  const roleMatches = adminRole === requestedRole || (adminRole === 'HR ADMIN' && requestedRole === 'HR');
  if (!roleMatches) {
    console.warn('[auth] role mismatch', { email, requested: role, stored: adminRole });
    throw new Error('Invalid role');
  }
  console.log('[auth] success', { email, role: adminRole, id: admin.id || admin._id });
  return {
    id: admin.id || admin._id,
    fullName: admin.full_name || admin.fullName || '',
    email: admin.email || '',
    role: adminRole,
  };
}

function generatePassword() {
  return crypto.randomBytes(9).toString('base64').replace(/[+/]/g, 'A'); // ~12 chars
}

async function createAdmin({ email, password, fullName, role }) {
  if (!email || !fullName || !role) {
    throw new Error('Email, fullName, and role are required');
  }

  const existing = await findAdminByEmail(email);
  if (existing) {
    throw new Error('Admin with this email already exists');
  }

  const finalPassword = password || generatePassword();
  const storedRole = role === 'HR' ? 'HR Admin' : role;
  const newAdmin = {
    email,
    // Store plaintext for workflow email and hash for auth
    password: finalPassword,
    password_hash: hashPassword(finalPassword),
    full_name: fullName,
    role: storedRole,
  };

  const { data: record, error } = await bolticClient.records.insert(ADMINS_TABLE, newAdmin);
  if (error) {
    console.error('[auth] createAdmin insert failed', { table: ADMINS_TABLE, error });
    throw new Error(error.message || JSON.stringify(error) || 'Failed to create admin');
  }

  return {
    id: record.id || record._id,
    fullName: record.full_name || fullName,
    email: record.email || email,
    role: record.role || storedRole,
    password: finalPassword, // returned for emailing; not stored in table
  };
}

module.exports = {
  authenticateAdmin,
  hashPassword,
  createAdmin,
};
