// import sqlite3 from 'sqlite3';
// import { open } from 'sqlite';

// const connection = await open({
//     filename: "users.db",
//     driver: sqlite3.Database
// });

// export default connection;
import "dotenv/config";
import pkg from 'pg';
const { Client } = pkg;

const client = new Client(process.env.COCKROACH_DB_URL);

(async () => {
    await client.connect();
    try {
      const results = await client.query("SELECT NOW()");
      console.log(results);
    } catch (err) {
      console.error("error executing query:", err);
    }
  })();

export default client;