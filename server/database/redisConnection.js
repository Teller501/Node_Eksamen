import { createClient } from 'redis';
import "dotenv/config";

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 15046
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;