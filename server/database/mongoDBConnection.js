import { MongoClient } from "mongodb";
import "dotenv/config";

const url = process.env.MONGODB_URL;
const client = new MongoClient(url);

const dbName = "cinematch";

await client.connect();

const db = client.db(dbName);

export default {
    movies: db.collection("movies"),
    activities: db.collection("activities"),
    recommendations: db.collection("recommendations"),
};
