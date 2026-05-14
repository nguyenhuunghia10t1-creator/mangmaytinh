const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const parts = header.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return fail(res, 'Unauthorized: missing token', 401);
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return fail(res, 'Server misconfigured: JWT_SECRET missing', 500);
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    return next();
  } catch (err) {
    return fail(res, 'Unauthorized: invalid or expired token', 401);
  }
}

function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 'Forbidden', 403);
    }
    return next();
  };
}

module.exports = { authMiddleware, requireRole };
