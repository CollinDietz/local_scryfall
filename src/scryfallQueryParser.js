// scryfallParserSimple.js
// Parse Scryfall-like text queries into a field-by-field JSON object.

const FIELD_MAP = {
  t: "type_line",
  type: "type_line",
  o: "oracle_text",
  oracle: "oracle_text",
  c: "colors",
  color: "colors",
  ci: "color_identity",
  cmc: "cmc",
  mana: "mana_cost",
  r: "rarity",
  pow: "power",
  tou: "toughness",
  n: "name",
  e: "set",
  set: "set",
  artist: "artist",
};

/**
 * Parse a query string like "t:dragon c:r cmc>3"
 * into a structured JSON object.
 */
function parseQueryToObject(query) {
  const tokens = tokenize(query);
  const parsed = tokens.map(parseToken).filter(Boolean);
  return mergeTokens(parsed);
}

/**
 * Break the string into tokens like ["t:dragon", "c:r", "cmc>3"]
 */
function tokenize(query) {
  const regex = /(-?\w+[:<>=!]*"[^"]+"|-?\w+[:<>=!]*\S+)/g;
  return query.match(regex) || [];
}

/**
 * Turn each token into a structured piece
 */
function parseToken(token) {
  let negated = false;
  let t = token.trim();

  if (t.startsWith("-")) {
    negated = true;
    t = t.slice(1);
  }

  const match = t.match(/^(\w+)([:<>=!]+)?(.+)?$/);
  if (!match) return null;

  let [, rawKey, operator, rawValue] = match;
  operator = operator || ":";
  let value = rawValue?.trim() || null;

  if (value && value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }

  const field = FIELD_MAP[rawKey] || rawKey;
  return { field, operator, value, negated };
}

/**
 * Merge parsed tokens into a single object
 */
function mergeTokens(tokens) {
  const result = {};

  for (const { field, operator, value, negated } of tokens) {
    if (!value) continue;

    // Handle numeric comparisons
    if (["<", ">", "<=", ">="].includes(operator)) {
      result[field] = { [operator]: parseFloat(value) };
      continue;
    }

    // Handle negation
    if (negated) {
      result[field] = result[field] || { include: [], exclude: [] };
      result[field].exclude.push(value);
      continue;
    }

    // Normal case
    if (!result[field]) {
      result[field] = [];
    }
    result[field].push(value);
  }

  return result;
}

module.exports = { parseQueryToObject };
