import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { fileURLToPath } from 'url';

export let tmdbIds = new Set();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadTmdbIds() {
    const filePath = path.resolve(__dirname, 'links.csv');
    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
            tmdbIds.add(row.tmdbId);
        })
}

loadTmdbIds();
