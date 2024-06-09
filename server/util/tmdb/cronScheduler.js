import cron from "node-cron";
import { fetchTMDBData } from "./tmdbPopulate.js";

export default function scheduleTMDBPopulation() {
    cron.schedule("* * * * *", async () => {
        console.log(`Fetching data at ${new Date().toISOString()}`);
        for (let i = 0; i < 10; i++) {
            fetchTMDBData();
        }
    });
}
