import cron from 'node-cron';
import fetchTMDBData from './tmdbPopulate.js';
import axios from 'axios';

export default function scheduleTMDBPopulation() {
    cron.schedule('* * * * * *', () => {
        // console.log(`Fetching data at ${new Date().toISOString()}`);
        fetchTMDBData();
    });
}