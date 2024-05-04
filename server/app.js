import "dotenv/config";
import express from 'express';

const app = express();

app.use(express.json());

import cors from "cors";
app.use(
    cors({
        credentials: true,
        origin: true,
    })
);

import { rateLimit } from 'express-rate-limit'
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 100,
	standardHeaders: 'draft-7',
	legacyHeaders: false, 
})

app.use(limiter)

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 4,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

app.use(["/api/login", "/api/signup", "/api/forgot-password", "/api/reset-password", "/api/token"], authRateLimiter);

import authRouter from './routers/authRouter.js';
app.use(authRouter);

import authenticateToken from "./util/authenticateToken.js";


app.get("/api/quote", authenticateToken, async (req, res) => {
	const response = await fetch("https://api.kanye.rest");
	const data = await response.json();
	res.send({ data: data.quote });
});



const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => console.log("Server is running on port", PORT));