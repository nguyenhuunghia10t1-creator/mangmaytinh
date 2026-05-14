const prisma = require('../config/prisma');
const { success, fail } = require('../utils/response');
const parseId = require('../utils/parseId');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOptionalString(value) {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function list(req, res, next) {
  try {
    const { q } = req.query;
    const where = {};
    if (typeof q === 'string' && q.trim().length > 0) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term } },
        { phone: { contains: term } },
        { email: { contains: term } },
        { address: { contains: term } },
      ];
    }
    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return success(res, { suppliers }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return fail(res, 'Invalid supplier id', 400);
    }
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      return fail(res, 'Supplier not found', 404);
    }
    return success(res, { supplier }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, phone, email, address } = req.body || {};
    if (!isNonEmptyString(name)) {
      return fail(res, 'name is required', 400);
    }

    const data = { name: name.trim() };

    if (typeof phone !== 'undefined') {
      const v = normalizeOptionalString(phone);
      if (v === undefined) return fail(res, 'phone must be a string or null', 400);
      data.phone = v;
    }

    if (typeof email !== 'undefined') {
      const v = normalizeOptionalString(email);
      if (v === undefined) return fail(res, 'email must be a string or null', 400);
      if (v !== null && !EMAIL_REGEX.test(v)) {
        return fail(res, 'Invalid email format', 400);
      }
      data.email = v;
    }

    if (typeof address !== 'undefined') {
      const v = normalizeOptionalString(address);
      if (v === undefined) return fail(res, 'address must be a string or null', 400);
      data.address = v;
    }

    const supplier = await prisma.supplier.create({ data });
    return success(res, { supplier }, 'Supplier created', 201);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return fail(res, 'Invalid supplier id', 400);
    }

    const { name, phone, email, address } = req.body || {};
    const data = {};

    if (typeof name !== 'undefined') {
      if (!isNonEmptyString(name)) {
        return fail(res, 'name must be a non-empty string', 400);
      }
      data.name = name.trim();
    }

    if (typeof phone !== 'undefined') {
      const v = normalizeOptionalString(phone);
      if (v === undefined) return fail(res, 'phone must be a string or null', 400);
      data.phone = v;
    }

    if (typeof email !== 'undefined') {
      const v = normalizeOptionalString(email);
      if (v === undefined) return fail(res, 'email must be a string or null', 400);
      if (v !== null && !EMAIL_REGEX.test(v)) {
        return fail(res, 'Invalid email format', 400);
      }
      data.email = v;
    }

    if (typeof address !== 'undefined') {
      const v = normalizeOptionalString(address);
      if (v === undefined) return fail(res, 'address must be a string or null', 400);
      data.address = v;
    }

    if (Object.keys(data).length === 0) {
      return fail(res, 'No updatable fields provided', 400);
    }

    const supplier = await prisma.supplier.update({ where: { id }, data });
    return success(res, { supplier }, 'Supplier updated');
  } catch (err) {
    if (err && err.code === 'P2025') {
      return fail(res, 'Supplier not found', 404);
    }
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return fail(res, 'Invalid supplier id', 400);
    }
    await prisma.supplier.delete({ where: { id } });
    return success(res, {}, 'Supplier deleted');
  } catch (err) {
    if (err && err.code === 'P2025') {
      return fail(res, 'Supplier not found', 404);
    }
    if (err && err.code === 'P2003') {
      return fail(
        res,
        'Cannot delete supplier: it is still referenced by one or more materials',
        409
      );
    }
    return next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
