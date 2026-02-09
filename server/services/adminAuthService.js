const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { bolticClient } = require('../config/boltic');

const ADMINS_TABLE = process.env.BOLTIC_ADMINS_TABLE_NAME || 'Admins';
const AUTH_SALT = process.env.ADMIN_AUTH_SALT || 'change_me';
const INVITE_SECRET = process.env.ADMIN_INVITE_SECRET || process.env.ADMIN_JWT_SECRET || 'dev_admin_secret';
const INVITE_TTL_MINUTES = Number(process.env.ADMIN_INVITE_TTL_MINUTES || 15);
const INVITE_FRONTEND_URL = process.env.ADMIN_INVITE_FRONTEND_URL || process.env.FRONTEND_URL || 'https://topboardai.vercel.app';
const ADMIN_INVITE_WEBHOOK_URL =
  process.env.BOLTIC_ADMIN_INVITE_WEBHOOK_URL ||
  process.env.BOLTIC_EMAIL_WEBHOOK_URL ||
  process.env.BOLTIC_WORKFLOW_WEBHOOK_URL ||
  'https://asia-south1.api.boltic.io/service/webhook/temporal/v1.0/873d2f04-081c-4c36-b216-ef22b0eb18f1/workflows/execute/59525975-a947-4975-8c43-a92693c935e5';

function hashPassword(password) {
  return crypto.createHash('sha256').update(AUTH_SALT + password).digest('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
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

async function upsertAdminRecord(email, payload) {
  const existing = await findAdminByEmail(email);
  if (existing) {
    const id = existing.id || existing._id;
    const { data, error } = await bolticClient.records.updateById(ADMINS_TABLE, id, payload);
    if (error) {
      throw new Error(error.message || 'Failed to update admin');
    }
    return data;
  }

  const { data, error } = await bolticClient.records.insert(ADMINS_TABLE, payload);
  if (error) {
    throw new Error(error.message || 'Failed to create admin');
  }
  return data;
}

async function issueHrInvite({ email, fullName, role = 'HR Admin' }) {
  if (!email || !fullName) {
    throw new Error('Email and fullName are required');
  }

  const tempPassword = generatePassword();
  const passwordHash = hashPassword(tempPassword);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MINUTES * 60 * 1000).toISOString();

  const inviteToken = jwt.sign(
    { email, role, tempPassword },
    INVITE_SECRET,
    { expiresIn: `${INVITE_TTL_MINUTES}m` }
  );

  const inviteTokenHash = hashToken(inviteToken);

  await upsertAdminRecord(email, {
    email,
    full_name: fullName,
    role,
    password_hash: passwordHash,
    password: null,
    password_plain: null,
    invite_token_hash: inviteTokenHash,
    invite_expires_at: expiresAt,
  });

  const inviteUrl = `${INVITE_FRONTEND_URL.replace(/\/$/, '')}/?invite=${encodeURIComponent(inviteToken)}`;

  if (ADMIN_INVITE_WEBHOOK_URL) {
    try {
      await axios.post(
        ADMIN_INVITE_WEBHOOK_URL,
        {
          template: 'hr_admin_invite',
          fullName,
          email,
          role,
          inviteUrl,
          expiresAt,
        },
        { timeout: 10000 }
      );
      console.log('[auth] invite email dispatched via Boltic webhook');
    } catch (err) {
      console.error('[auth] invite email dispatch failed', err.message);
    }
  } else {
    console.log('[auth] BOLTIC_EMAIL_WEBHOOK_URL not set; inviteUrl:', inviteUrl);
  }

  return { inviteToken, inviteUrl, expiresAt, email, fullName, role };
}

async function consumeInviteToken(rawToken) {
  if (!rawToken) {
    throw new Error('Invite token is required');
  }
  const payload = jwt.verify(rawToken, INVITE_SECRET);
  const email = payload.email;
  const tempPassword = payload.tempPassword;
  if (!email || !tempPassword) {
    throw new Error('Invalid invite token payload');
  }

  const admin = await findAdminByEmail(email);
  if (!admin) {
    throw new Error('Invite not found');
  }

  const storedHash = admin.invite_token_hash || admin.inviteTokenHash;
  const expiresAt = admin.invite_expires_at || admin.inviteExpiresAt;
  const now = Date.now();

  if (!storedHash || storedHash !== hashToken(rawToken)) {
    throw new Error('Invite token invalid or already used');
  }

  if (expiresAt && new Date(expiresAt).getTime() < now) {
    throw new Error('Invite token expired');
  }

  const id = admin.id || admin._id;
  await bolticClient.records.updateById(ADMINS_TABLE, id, {
    invite_token_hash: null,
    invite_expires_at: null,
    last_invite_consumed_at: new Date().toISOString(),
  });

  return {
    email,
    role: admin.role || 'HR Admin',
    tempPassword,
  };
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
    // Store only hash in Boltic; plaintext is returned to caller but not persisted
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
  issueHrInvite,
  consumeInviteToken,
};
