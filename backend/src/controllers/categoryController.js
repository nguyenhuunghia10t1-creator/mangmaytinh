const prisma = require('../config/prisma');
const { success, fail } = require('../utils/response');
const parseId = require('../utils/parseId');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function list(req, res, next) {
  try {
    const { q } = req.query;
    const where = {};
    if (typeof q === 'string' && q.trim().length > 0) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term } },
        { description: { contains: term } },
      ];
    }
    const categories = await prisma.category.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return success(res, { categories }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return fail(res, 'Invalid category id', 400);
    }
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return fail(res, 'Category not found', 404);
    }
    return success(res, { category }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, description } = req.body || {};
    if (!isNonEmptyString(name)) {
      return fail(res, 'name is required', 400);
    }
    const cleanName = name.trim();
    const cleanDescription =
      typeof description === 'string' ? description.trim() : null;

    const category = await prisma.category.create({
      data: {
        name: cleanName,
        description: cleanDescription && cleanDescription.length > 0 ? cleanDescription : null,
      },
    });
    return success(res, { category }, 'Category created', 201);
  } catch (err) {
    if (err && err.code === 'P2002') {
      return fail(res, 'Category name already exists', 409);
    }
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return fail(res, 'Invalid category id', 400);
    }

    const { name, description } = req.body || {};
    const data = {};

    if (typeof name !== 'undefined') {
      if (!isNonEmptyString(name)) {
        return fail(res, 'name must be a non-empty string', 400);
      }
      data.name = name.trim();
    }

    if (typeof description !== 'undefined') {
      if (description === null) {
        data.description = null;
      } else if (typeof description === 'string') {
        const trimmed = description.trim();
        data.description = trimmed.length > 0 ? trimmed : null;
      } else {
        return fail(res, 'description must be a string or null', 400);
      }
    }

    if (Object.keys(data).length === 0) {
      return fail(res, 'No updatable fields provided', 400);
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });
    return success(res, { category }, 'Category updated');
  } catch (err) {
    if (err && err.code === 'P2025') {
      return fail(res, 'Category not found', 404);
    }
    if (err && err.code === 'P2002') {
      return fail(res, 'Category name already exists', 409);
    }
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return fail(res, 'Invalid category id', 400);
    }
    await prisma.category.delete({ where: { id } });
    return success(res, {}, 'Category deleted');
  } catch (err) {
    if (err && err.code === 'P2025') {
      return fail(res, 'Category not found', 404);
    }
    if (err && err.code === 'P2003') {
      return fail(
        res,
        'Cannot delete category: it is still referenced by one or more materials',
        409
      );
    }
    return next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
