const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { success, fail } = require('../utils/response');

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return fail(res, 'username and password are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return fail(res, 'Invalid username or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return fail(res, 'Invalid username or password', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return fail(res, 'Server misconfigured: JWT_SECRET missing', 500);
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn }
    );

    return success(
      res,
      {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          role: user.role,
        },
      },
      'Login successful'
    );
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return fail(res, 'Unauthorized', 401);
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, fullName: true, username: true, role: true },
    });
    if (!user) {
      return fail(res, 'User not found', 404);
    }
    return success(res, { user }, 'OK');
  } catch (err) {
    return next(err);
  }
}

module.exports = { login, me };
