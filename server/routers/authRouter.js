import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import redisClient from "../database/redisConnection.js"
import db from "../database/connection.js"
import { validateUserSignup, validateUserLogin, validateToken, validateForgotPassword, validateResetPassword } from "../middleware/userValidation.js";

const router = Router();

import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

const users = [];
const saltRounds = 14;

function generateAccessToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });
}

async function sendActivationEmail(email, activationToken) {
    const activationLink = `http://localhost:5173/activate/${activationToken}`;
    const message = {
        from: "Admin <noreply@andersteller.dk>",
        to: email,
        subject: "Please activate your account",
        html: `<p>Thank you for signing up at Mandatory II! Please click the link below to activate your account:</p>
        <a href="${activationLink}">Activate account</a>`,
    };

    const { data, error } = await resend.emails.send(message);

    if (error) {
        console.error(error);
    }

}

async function sendResetEmail(email, resetToken) {
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    const message = {
        from: "Admin <noreply@andersteller.dk>",
        to: email,
        subject: "Reset your password",
        html: `<p>You've requrested to resest your password, please click the link below to reset:</p>
        <a href="${resetLink}">Reset password</a>`,
    }

    const { data, error } = await resend.emails.send(message);

    if (error) {
        console.error(error);
    }

}

router.get("/api/activate/:token", validateToken, async (req, res) => {
    const token = req.params.token;
    const username = await redisClient.get(token);

    if (!username) {
        return res.status(400).send({ error: "Invalid activation token" });
    }

    const user = db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    if (!user) {
        return res.status(400).send({ error: "User not found" });
    }

    await db.run(`UPDATE users SET is_active = TRUE WHERE username = ?`, [username]);
    await redisClient.del(token);

    res.send({ data: "User activated" });
});

router.post("/api/login", validateUserLogin, async (req, res) => {
    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [req.body.username]);
    if (!user) {
        return res.status(400).send({ error: "User not found" });
    }

    if (!user.is_active) {
        return res.status(400).send({ error: "User not activated" });
    }

    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const token = generateAccessToken(user);
            const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET);
            redisClient.set(refreshToken, user.username, { EX: 1800 });
            res.send({ token: token, refreshToken: refreshToken, user: user });
        } else {
            res.status(400).send({ error: "Invalid password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred" });
    }
});

router.post("/api/signup", validateUserSignup, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            isActive: false,
        };
        const activationToken = crypto.randomBytes(32).toString("hex");

        const result = await db.run(`INSERT INTO users (username, email, password, is_active) VALUES (?, ?, ?, ?) `, [user.username, user.email, user.password, user.isActive]);
        await redisClient.set(activationToken, user.username, { EX: 3600 });

        await sendActivationEmail(user.email, activationToken);

        res.status(201).send({ data: "User created" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error creating the user" });
    }
});

router.post("/api/token", validateToken, async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(401);
    
    const foundToken = await redisClient.get(refreshToken);
    if (!foundToken) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const newToken = generateAccessToken({ username: user.username });
        res.json({ token: newToken });
    });
});

router.post("/api/forgot-password", validateForgotPassword, async (req, res) => {
    const { email } = req.body;
    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);

    if (!user) {
        return res.status(400).send({ error: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    redisClient.set(resetToken, user.username, { EX: 3600 });
    redisClient.set(resetToken, user.username, { EX: 3600 });

    await sendResetEmail(email, resetToken);

    res.send({ data: "Reset email sent" });
});

router.post("/api/reset-password/:token", validateResetPassword, async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const username = await redisClient.get(token);
    if (!username) {
        return res.status(400).send({ error: "Invalid or expired token" });
    }

    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    if (!user) {
        return res.status(400).send({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await db.run(`UPDATE users SET password = ? WHERE username = ?`, [hashedPassword, username]);

    await redisClient.del(token);

    res.send({ data: "Password reset successfully" });
});

router.post("/api/validate-token", async (req, res) => {
    const token = req.body.token;
    
    const validToken = await redisClient.get(token);

    if (!validToken) {
        return res.status(400).send({ error: "Invalid or expired token" });
    }

    res.send({ data: "Token is valid" });
});



router.delete("/api/logout", (req, res) => {
    redisClient.del(req.body.token);
    res.sendStatus(204);
});

export default router;
