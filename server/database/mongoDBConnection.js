import "dotenv/config";
import { MongoClient } from "mongodb";

const url = process.env.MONGODB_URL;
const client = new MongoClient(url);

const dbName = "cinematch";

await client.connect();

const db = client.db(dbName);

export default {
    activities: db.collection("activities"),
    recommendations: db.collection("recommendations"),
};
