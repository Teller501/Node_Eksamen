import "dotenv/config";

import express from "express";
const app = express();

import path from "path";
const imagesDir = path.resolve("./images");
app.use("/images", express.static(imagesDir));

app.use(express.json({ limit: "2mb" }));

// import scheduleTMDBPopulation from "./util/tmdb/cronScheduler.js";
// scheduleTMDBPopulation();

import cors from "cors";
app.use(
    cors({
        credentials: true,
        origin: true,
    })
);

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

import { rateLimit } from "express-rate-limit";
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

app.use(limiter);

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 4,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

app.use(["/api/login", "/api/signup"], authRateLimiter);

import authRouter from "./routers/authRouter.js";
app.use(authRouter);

import moivesRouter from "./routers/moviesRouter.js";
app.use(moivesRouter);

import logsRouter from "./routers/logsRouter.js";
app.use(logsRouter);

import recommendationsRouter from "./routers/recommendationsRouter.js";
app.use(recommendationsRouter);

import usersRouter from "./routers/usersRouter.js";
app.use(usersRouter);

import favoritesRouter from "./routers/favoritesRouter.js";
app.use(favoritesRouter);

import watchlistRouter from "./routers/watchlistRouter.js";
app.use(watchlistRouter);

import listsRouter from "./routers/listsRouter.js";
app.use(listsRouter);

import activitiesRouter from "./routers/activitiesRouter.js";
app.use(activitiesRouter);

import followsRouter from "./routers/followsRouter.js";
app.use(followsRouter);

import likesRouter from "./routers/likesRouter.js";
app.use(likesRouter);

import contactRouter from "./routers/contactRouter.js";
app.use(contactRouter);

import mongoClient from "./database/mongoDBConnection.js";

const options = { fullDocument: "updateLookup" };
const changeStream = mongoClient.activities.watch([], options);

changeStream.on("change", (next) => {
    io.emit("activityLogUpdate", { data: next.fullDocument });
});

import authenticateToken from "./util/authenticateToken.js";

const PORT = process.env.PORT ?? 8080;
server.listen(PORT, () => console.log("Server is running on port", PORT));
