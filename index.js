#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import ora from 'ora';
import minimist from 'minimist';
import { dbSetup } from './src/dbSetup.js';
import { parseQueryToObject } from './src/scryfallQueryParser.js';
import { buildLokiQuery } from './src/queryBuilder.js';

const DATA_DIR = path.resolve('./data');
const JSON_FILE = path.join(DATA_DIR, 'all_cards.json');
const BULK_URL = 'https://api.scryfall.com/bulk-data/default-cards';

async function fetchLatestScryfall() {
  const spinner = ora('Fetching Scryfall bulk metadata...').start();
  try {
    const { data } = await axios.get(BULK_URL);
    console.log(data);
    const downloadUri = data?.download_uri;
    if (!downloadUri) throw new Error('No download URI found');

    spinner.text = 'Downloading full card data (this may take a while)...';
    const response = await axios.get(downloadUri, { responseType: 'arraybuffer' });
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(JSON_FILE, response.data);

    spinner.succeed(`Saved latest Scryfall data to ${JSON_FILE}`);
  } catch (err) {
    spinner.fail(`Failed to fetch bulk data: ${err.message}`);
    process.exit(1);
  }
}

async function handleInit() {
  if (fs.existsSync(JSON_FILE)) {
    const stats = fs.statSync(JSON_FILE);
    console.log(`📦 Found existing dataset (${(stats.size / 1e6).toFixed(2)} MB).`);
  } else {
    await fetchLatestScryfall();
  }

  const cards = await dbSetup(JSON_FILE);
  console.log(`✅ Initialized local DB with ${cards.count()} cards.`);
}

async function handleSearch(queryString) {
  const cards = await dbSetup(JSON_FILE);
  const queryObj = parseQueryToObject(queryString);
  const lokiQuery = buildLokiQuery(queryObj);

  const results = cards.find(lokiQuery);
  console.log(`🔍 Found ${results.length} matching cards.`);
  results.slice(0, 10).forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} — ${c.mana_cost || ''} - ${c.scryfall_uri}`);
  });
}

(async () => {
  const args = minimist(process.argv.slice(2));

  if (args.init) {
    await handleInit();
  } else if (args.search) {
    await handleSearch(args.search);
  } else {
    console.log(`
🪄 Local Scryfall CLI
Usage:
  --init           Download latest Scryfall data and build cache
  --search="query" Search locally (e.g. --search="t:dragon c:r cmc<=5")
`);
  }
})();
