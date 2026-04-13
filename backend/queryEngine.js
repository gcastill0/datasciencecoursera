/**
 * Parse a simple query string and return a predicate function.
 * Supported syntax:
 * - field=value
 * - field!=value
 * - contains(field,"value")
 */
function buildPredicate(query) {
  if (!query || typeof query !== 'string') {
    return () => true;
  }

  const trimmed = query.trim();

  // contains(field,"value")
  const containsMatch = trimmed.match(/^contains\((\w+)\s*,\s*"([^"]*)"\)$/i);
  if (containsMatch) {
    const [, field, value] = containsMatch;
    const needle = value.toLowerCase();
    return (row) => String(row[field] ?? '').toLowerCase().includes(needle);
  }

  // field!=value
  const notEqualMatch = trimmed.match(/^(\w+)\s*!=\s*(.+)$/);
  if (notEqualMatch) {
    const [, field, value] = notEqualMatch;
    const expected = stripQuotes(value.trim());
    return (row) => String(row[field] ?? '') !== expected;
  }

  // field=value
  const equalMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
  if (equalMatch) {
    const [, field, value] = equalMatch;
    const expected = stripQuotes(value.trim());
    return (row) => String(row[field] ?? '') === expected;
  }

  // Unsupported query syntax.
  throw new Error('Unsupported query syntax. Use field=value, field!=value, or contains(field,"value").');
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Execute query on log rows.
 */
function executeQuery(rows, query) {
  const predicate = buildPredicate(query);
  return rows.filter(predicate);
}

/**
 * Count rows by a field for simple aggregation tasks.
 */
function countByField(rows, field) {
  const counts = {};

  for (const row of rows) {
    const key = String(row[field] ?? '');
    counts[key] = (counts[key] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

module.exports = {
  executeQuery,
  countByField,
};
