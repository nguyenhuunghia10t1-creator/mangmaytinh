function parseId(raw) {
  if (raw === undefined || raw === null) return null;
  const trimmed = String(raw).trim();
  const id = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(id) || id <= 0 || String(id) !== trimmed) {
    return null;
  }
  return id;
}

module.exports = parseId;
