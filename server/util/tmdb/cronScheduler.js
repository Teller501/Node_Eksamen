import cron from "node-cron";
import { fetchTMDBData } from "./tmdbPopulate.js";

export default function scheduleTMDBPopulation() {
    cron.schedule('*/5 * * * *', async () => {
        console.log(`Fetching data at ${new Date().toISOString()}`);
        for (let i = 0; i < 20; i++) {
            fetchTMDBData();
        }
    });
}
