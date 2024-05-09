import cron from 'node-cron';
import fetchTMDBData from './tmdbPopulate.js';

export default function scheduleTMDBPopulation() {
    cron.schedule('0,30 * * * *', () => {
        console.log(`Fetching data at ${new Date().toISOString()}`);
        fetchTMDBData();
    });
}