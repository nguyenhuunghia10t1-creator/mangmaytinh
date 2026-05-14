const prisma = require('../config/prisma');
const { success, fail } = require('../utils/response');
const parseId = require('../utils/parseId');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeInteger(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isPositiveInteger(value) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function normalizeOptionalString(value) {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const MATERIAL_INCLUDE = {
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
};

async function list(req, res, next) {
  try {
    const { q, categoryId, supplierId } = req.query;
    const where = {};

    if (typeof q === 'string' && q.trim().length > 0) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term } },
        { description: { contains: term } },
      ];
    }

    if (typeof categoryId !== 'undefined') {
      const cid = parseId(categoryId);
      if (cid === null) return fail(res, 'Invalid categoryId', 400);
      where.categoryId = cid;
    }

    if (typeof supplierId !== 'undefined') {
      const sid = parseId(supplierId);
      if (sid === null) return fail(res, 'Invalid supplierId', 400);
      where.supplierId = sid;
    }

    const materials = await prisma.material.findMany({
      where,
      orderBy: { id: 'asc' },
      include: MATERIAL_INCLUDE,
    });
    return success(res, { materials }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return fail(res, 'Invalid material id', 400);

    const material = await prisma.material.findUnique({
      where: { id },
      include: MATERIAL_INCLUDE,
    });
    if (!material) return fail(res, 'Material not found', 404);
    return success(res, { material }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const body = req.body || {};
    const {
      name,
      categoryId,
      supplierId,
      quantity,
      unit,
      importPrice,
      sellPrice,
      description,
      imageUrl,
    } = body;

    if (!isNonEmptyString(name)) {
      return fail(res, 'name is required', 400);
    }
    if (!isPositiveInteger(categoryId)) {
      return fail(res, 'categoryId is required and must be a positive integer', 400);
    }
    if (!isPositiveInteger(supplierId)) {
      return fail(res, 'supplierId is required and must be a positive integer', 400);
    }
    if (!isNonEmptyString(unit)) {
      return fail(res, 'unit is required', 400);
    }

    const data = {
      name: name.trim(),
      categoryId,
      supplierId,
      unit: unit.trim(),
    };

    if (typeof quantity !== 'undefined') {
      if (!isNonNegativeInteger(quantity)) {
        return fail(res, 'quantity must be a non-negative integer', 400);
      }
      data.quantity = quantity;
    }

    if (typeof importPrice !== 'undefined') {
      if (!isNonNegativeNumber(importPrice)) {
        return fail(res, 'importPrice must be a non-negative number', 400);
      }
      data.importPrice = importPrice;
    }

    if (typeof sellPrice !== 'undefined') {
      if (!isNonNegativeNumber(sellPrice)) {
        return fail(res, 'sellPrice must be a non-negative number', 400);
      }
      data.sellPrice = sellPrice;
    }

    if (typeof description !== 'undefined') {
      const v = normalizeOptionalString(description);
      if (v === undefined) return fail(res, 'description must be a string or null', 400);
      data.description = v;
    }

    if (typeof imageUrl !== 'undefined') {
      const v = normalizeOptionalString(imageUrl);
      if (v === undefined) return fail(res, 'imageUrl must be a string or null', 400);
      if (v !== null && !isValidHttpUrl(v)) {
        return fail(res, 'Invalid imageUrl', 400);
      }
      data.imageUrl = v;
    }

    const [category, supplier] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
      prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true } }),
    ]);
    if (!category) return fail(res, 'categoryId does not exist', 400);
    if (!supplier) return fail(res, 'supplierId does not exist', 400);

    const material = await prisma.material.create({
      data,
      include: MATERIAL_INCLUDE,
    });
    return success(res, { material }, 'Material created', 201);
  } catch (err) {
    if (err && err.code === 'P2003') {
      return fail(res, 'Invalid categoryId or supplierId', 409);
    }
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return fail(res, 'Invalid material id', 400);

    const body = req.body || {};
    const data = {};
    const fkChecks = [];

    if (typeof body.name !== 'undefined') {
      if (!isNonEmptyString(body.name)) {
        return fail(res, 'name must be a non-empty string', 400);
      }
      data.name = body.name.trim();
    }

    if (typeof body.categoryId !== 'undefined') {
      if (!isPositiveInteger(body.categoryId)) {
        return fail(res, 'categoryId must be a positive integer', 400);
      }
      data.categoryId = body.categoryId;
      fkChecks.push(
        prisma.category
          .findUnique({ where: { id: body.categoryId }, select: { id: true } })
          .then((c) => ({ kind: 'category', exists: !!c }))
      );
    }

    if (typeof body.supplierId !== 'undefined') {
      if (!isPositiveInteger(body.supplierId)) {
        return fail(res, 'supplierId must be a positive integer', 400);
      }
      data.supplierId = body.supplierId;
      fkChecks.push(
        prisma.supplier
          .findUnique({ where: { id: body.supplierId }, select: { id: true } })
          .then((s) => ({ kind: 'supplier', exists: !!s }))
      );
    }

    if (typeof body.quantity !== 'undefined') {
      if (!isNonNegativeInteger(body.quantity)) {
        return fail(res, 'quantity must be a non-negative integer', 400);
      }
      data.quantity = body.quantity;
    }

    if (typeof body.unit !== 'undefined') {
      if (!isNonEmptyString(body.unit)) {
        return fail(res, 'unit must be a non-empty string', 400);
      }
      data.unit = body.unit.trim();
    }

    if (typeof body.importPrice !== 'undefined') {
      if (!isNonNegativeNumber(body.importPrice)) {
        return fail(res, 'importPrice must be a non-negative number', 400);
      }
      data.importPrice = body.importPrice;
    }

    if (typeof body.sellPrice !== 'undefined') {
      if (!isNonNegativeNumber(body.sellPrice)) {
        return fail(res, 'sellPrice must be a non-negative number', 400);
      }
      data.sellPrice = body.sellPrice;
    }

    if (typeof body.description !== 'undefined') {
      const v = normalizeOptionalString(body.description);
      if (v === undefined) return fail(res, 'description must be a string or null', 400);
      data.description = v;
    }

    if (typeof body.imageUrl !== 'undefined') {
      const v = normalizeOptionalString(body.imageUrl);
      if (v === undefined) return fail(res, 'imageUrl must be a string or null', 400);
      if (v !== null && !isValidHttpUrl(v)) {
        return fail(res, 'Invalid imageUrl', 400);
      }
      data.imageUrl = v;
    }

    if (Object.keys(data).length === 0) {
      return fail(res, 'No updatable fields provided', 400);
    }

    if (fkChecks.length > 0) {
      const results = await Promise.all(fkChecks);
      for (const r of results) {
        if (!r.exists) {
          return fail(res, `${r.kind}Id does not exist`, 400);
        }
      }
    }

    const material = await prisma.material.update({
      where: { id },
      data,
      include: MATERIAL_INCLUDE,
    });
    return success(res, { material }, 'Material updated');
  } catch (err) {
    if (err && err.code === 'P2025') {
      return fail(res, 'Material not found', 404);
    }
    if (err && err.code === 'P2003') {
      return fail(res, 'Invalid categoryId or supplierId', 409);
    }
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return fail(res, 'Invalid material id', 400);
    await prisma.material.delete({ where: { id } });
    return success(res, {}, 'Material deleted');
  } catch (err) {
    if (err && err.code === 'P2025') {
      return fail(res, 'Material not found', 404);
    }
    return next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
