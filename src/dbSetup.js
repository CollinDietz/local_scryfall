// dbSetup.js
const fs = require("fs");
const Loki = require("lokijs");

function loadDatabase(jsonPath) {
  const db = new Loki("cards.db");
  const cards = db.addCollection("cards", {
    indices: ["name", "cmc", "colors", "type_line"],
  });

  const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  cards.insert(rawData);

  return { db, cards };
}

module.exports = { loadDatabase };
