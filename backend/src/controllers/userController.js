const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { success, fail } = require('../utils/response');
const parseId = require('../utils/parseId');

const VALID_ROLES = new Set(['admin', 'staff']);
const PASSWORD_MIN_LENGTH = 6;
const BCRYPT_COST = 10;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sanitizeUser(user) {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return rest;
}

async function list(req, res, next) {
  try {
    const { q } = req.query;
    const where = {};
    if (typeof q === 'string' && q.trim().length > 0) {
      const term = q.trim();
      where.OR = [
        { fullName: { contains: term } },
        { username: { contains: term } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return success(res, { users }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return fail(res, 'Invalid user id', 400);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return fail(res, 'User not found', 404);
    return success(res, { user }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { fullName, username, password, role } = req.body || {};

    if (!isNonEmptyString(fullName)) {
      return fail(res, 'fullName is required', 400);
    }
    if (!isNonEmptyString(username)) {
      return fail(res, 'username is required', 400);
    }
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
      return fail(res, `password must be at least ${PASSWORD_MIN_LENGTH} characters`, 400);
    }
    let finalRole = 'staff';
    if (typeof role !== 'undefined') {
      if (typeof role !== 'string' || !VALID_ROLES.has(role)) {
        return fail(res, 'role must be "admin" or "staff"', 400);
      }
      finalRole = role;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const created = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        username: username.trim(),
        passwordHash,
        role: finalRole,
      },
    });
    return success(res, { user: sanitizeUser(created) }, 'User created', 201);
  } catch (err) {
    if (err && err.code === 'P2002') {
      return fail(res, 'Username already exists', 409);
    }
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return fail(res, 'Invalid user id', 400);

    const { fullName, username, password, role } = req.body || {};
    const data = {};

    if (typeof fullName !== 'undefined') {
      if (!isNonEmptyString(fullName)) {
        return fail(res, 'fullName must be a non-empty string', 400);
      }
      data.fullName = fullName.trim();
    }

    if (typeof username !== 'undefined') {
      if (!isNonEmptyString(username)) {
        return fail(res, 'username must be a non-empty string', 400);
      }
      data.username = username.trim();
    }

    if (typeof password !== 'undefined') {
      if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
        return fail(res, `password must be at least ${PASSWORD_MIN_LENGTH} characters`, 400);
      }
      data.passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    }

    if (typeof role !== 'undefined') {
      if (typeof role !== 'string' || !VALID_ROLES.has(role)) {
        return fail(res, 'role must be "admin" or "staff"', 400);
      }
      data.role = role;
    }

    if (Object.keys(data).length === 0) {
      return fail(res, 'No updatable fields provided', 400);
    }

    const updated = await prisma.user.update({ where: { id }, data });
    return success(res, { user: sanitizeUser(updated) }, 'User updated');
  } catch (err) {
    if (err && err.code === 'P2025') {
      return fail(res, 'User not found', 404);
    }
    if (err && err.code === 'P2002') {
      return fail(res, 'Username already exists', 409);
    }
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return fail(res, 'Invalid user id', 400);

    if (req.user && req.user.id === id) {
      return fail(res, 'Cannot delete your own account', 400);
    }

    await prisma.user.delete({ where: { id } });
    return success(res, {}, 'User deleted');
  } catch (err) {
    if (err && err.code === 'P2025') {
      return fail(res, 'User not found', 404);
    }
    return next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
