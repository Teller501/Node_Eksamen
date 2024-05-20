import cron from 'node-cron';
import fetchTMDBData from './tmdbPopulate.js';
import axios from 'axios';

export default function scheduleTMDBPopulation() {
    cron.schedule('*/10 * * * *', async () => {
        console.log(`Fetching data at ${new Date().toISOString()}`);
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
    cron.schedule('*/10 * * * *', async () => {
        await fetchTMDBData();
    });
}