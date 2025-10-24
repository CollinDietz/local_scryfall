import loki from 'lokijs';
import fs from 'fs';
import path from 'path';
import ora from 'ora';

export async function dbSetup(jsonPath) {

  const absJsonPath = path.resolve(jsonPath);
  const baseName = path.basename(absJsonPath, path.extname(absJsonPath));
  const cacheDir = path.join(path.dirname(absJsonPath), '.cache');
  const dbPath = path.join(cacheDir, `${baseName}.db`);

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const spinner = ora('Initializing database...').start();

  return new Promise((resolve, reject) => {
    const dbExists = fs.existsSync(dbPath);

    const db = new loki(dbPath);

    if (dbExists) {
      spinner.text = 'Loading cached .db file...';
      db.loadDatabase({}, (err) => {
        if (err) {
          spinner.fail('Failed to load cached database.');
          return reject(err);
        }

        let cards = db.getCollection('cards');
        if (!cards) {
          spinner.fail('No "cards" collection found in .db file.');
          return reject(new Error('Missing collection.'));
        }

        spinner.succeed(`Loaded cached database from ${dbPath}`);
        resolve(cards);
      });
    } else {
      spinner.text = 'No cache found — loading JSON dataset...';

      try {
        if (!fs.existsSync(absJsonPath)) {
          spinner.fail(`JSON file not found: ${absJsonPath}`);
          return reject(new Error(`Missing JSON file: ${absJsonPath}`));
        }

        const data = JSON.parse(fs.readFileSync(absJsonPath, 'utf8'));

        spinner.text = `Inserting ${data.length.toLocaleString()} cards...`;
        const cards = db.addCollection('cards', {
          indices: ['name', 'type_line', 'colors', 'cmc'],
        });
        cards.insert(data);

        spinner.text = 'Saving cache to disk...';
        db.saveDatabase((err) => {
          if (err) {
            spinner.fail('Failed to save cache.');
            return reject(err);
          }
          spinner.succeed(`Database cached at ${dbPath}`);
          resolve(cards);
        });
      } catch (err) {
        spinner.fail('Error loading JSON file.');
        reject(err);
      }
    }
  });
}
