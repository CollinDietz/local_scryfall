// searchCards.js
const { parseQueryToObject } = require("./src/scryfallQueryParser");
const { loadDatabase } = require("./src/dbSetup");
const { buildLokiQuery } = require("./src/queryBuilder");

function searchCards(queryText, jsonPath) {
  console.log(`Loading database from ${jsonPath}...`);
  const { cards } = loadDatabase(jsonPath);
  console.log("Done loading database.");

  console.log(`Parsing ${queryText}`);
  const queryObj = parseQueryToObject(queryText);
  console.log(queryObj);

  const lokiQuery = buildLokiQuery(queryObj);
  console.log(lokiQuery);

  const results = cards.find(lokiQuery);
  // console.log(results);

  return results.map((c) => ({
    name: c.name,
    cmc: c.cmc,
    colors: c.colors,
    type_line: c.type_line,
  }));
}

  const result = searchCards('t:Dragon c:R cmc>3', 'oracle-cards-20251022090300.json');
  console.log(result.slice(0, 5));
