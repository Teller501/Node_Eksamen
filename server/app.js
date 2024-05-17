import "dotenv/config";
import express from "express";

const app = express();

import path from "path";
const imagesDir = path.resolve('./images');
app.use('/images', express.static(imagesDir));

app.use(express.json({ limit: "2mb" }));

import scheduleTMDBPopulation from "./util/tmdb/cronScheduler.js";
scheduleTMDBPopulation();

import cors from "cors";
app.use(
    cors({
        credentials: true,
        origin: true,
    })
);

import { rateLimit } from "express-rate-limit";
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
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

import logRouter from "./routers/logRouter.js";
app.use(logRouter);

import recommendationsRouter from "./routers/recommendationsRouter.js";
app.use(recommendationsRouter);

import userRouter from "./routers/userRouter.js";
app.use(userRouter);

import authenticateToken from "./util/authenticateToken.js";

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => console.log("Server is running on port", PORT));
