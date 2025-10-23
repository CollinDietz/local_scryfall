// queryBuilder.js
function buildLokiQuery(queryObject) {
  const lokiQuery = {};

  for (const [key, val] of Object.entries(queryObject)) {
    if (Array.isArray(val)) {
      // string fields like type, colors, etc.
      lokiQuery[key] = { "$containsAny": val };
    } else if (typeof val === "object") {
      const operator = Object.keys(val)[0];
      const value = val[operator];
      switch (operator) {
        case ">":
          lokiQuery[key] = { "$gt": value };
          break;
        case "<":
          lokiQuery[key] = { "$lt": value };
          break;
        case ">=":
          lokiQuery[key] = { "$gte": value };
          break;
        case "<=":
          lokiQuery[key] = { "$lte": value };
          break;
        default:
          break;
      }
    }
  }

  return lokiQuery;
}

module.exports = { buildLokiQuery };
