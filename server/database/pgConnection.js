import "dotenv/config";
import pkg from 'pg';
const { Client } = pkg;

const client = new Client(process.env.COCKROACH_DB_URL);

(async () => {
    await client.connect();
    try {
      const results = await client.query("SELECT NOW()");
    } catch (err) {
      console.error("error executing query:", err);
    }
  })();

export default client;