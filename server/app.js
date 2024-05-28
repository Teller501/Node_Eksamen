import "dotenv/config";
import express from "express";
const app = express();
import path from "path";
const imagesDir = path.resolve("./images");
app.use("/images", express.static(imagesDir));
app.use(express.json({ limit: "2mb" }));
// import scheduleTMDBPopulation from "./util/tmdb/cronScheduler.js";
// scheduleTMDBPopulation();
import corsMiddleware from './middleware/cors.js';
app.use(corsMiddleware);

import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});
export { io };

import { limiter, authRateLimiter } from './middleware/rateLimit.js';
app.use(limiter);
app.use(['/api/login', '/api/signup'], authRateLimiter);

import routes from "./routes.js";
Object.values(routes).forEach((router) => app.use(router));

import mongoClient from "./database/mongoDBConnection.js";
const options = { fullDocument: "updateLookup" };
const changeStream = mongoClient.activities.watch([], options);
changeStream.on("change", (next) => {
  io.emit("activityLogUpdate", { data: next.fullDocument });
});

const PORT = process.env.PORT ?? 8080;
server.listen(PORT, () => console.log("Server is running on port", PORT));