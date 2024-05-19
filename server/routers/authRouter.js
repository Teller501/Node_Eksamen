import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import redisClient from "../database/redisConnection.js";
import pgClient from "../database/pgConnection.js";
import {
    validateUserSignup,
    validateUserLogin,
    validateToken,
    validateForgotPassword,
    validateResetPassword,
} from "../middleware/userValidation.js";

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
        from: `Admin <noreply@${process.env.MAIL_DOMAIN}>`,
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
        from: `Admin <noreply@${process.env.MAIL_DOMAIN}>`,
        to: email,
        subject: "Reset your password",
        html: `<p>You've requrested to resest your password, please click the link below to reset:</p>
        <a href="${resetLink}">Reset password</a>`,
    };

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

    const user = pgClient.query(`SELECT * FROM users WHERE username = $1`, [
        username,
    ]);
    if (!user) {
        return res.status(400).send({ error: "User not found" });
    }

    await pgClient.query(
        `UPDATE users SET is_active = TRUE WHERE username = $1`,
        [username]
    );
    await redisClient.del(token);

    res.send({ data: "User activated" });
});

router.post("/api/login", validateUserLogin, async (req, res) => {
    const result = await pgClient.query(
        `SELECT * FROM users WHERE username = $1`,
        [req.body.username]
    );

    if (result.rowCount === 0) {
        return res.status(400).send({ error: "User not found" });
    }

    const user = result.rows[0];

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

        const result = await pgClient.query(
            `INSERT INTO users (username, email, password, is_active) VALUES ($1, $2, $3, $4) `,
            [user.username, user.email, user.password, user.isActive]
        );
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
  
      pgClient.query(`SELECT is_active FROM users WHERE username = $1`, [user.username])
        .then(async (result) => {
          const isActive = result.rows[0].is_active;
          const rememberMeFlag = await redisClient.get(`${refreshToken}:rememberMe`);
  
          if (!isActive) {
            return res.status(403).send({ error: "User not activated" });
          }
  
          const newToken = generateAccessToken({ username: user.username });
  
          const expirationTime = rememberMeFlag === "true" ? 604800 : 1800; 
          await redisClient.set(refreshToken, user.username, { EX: expirationTime });
  
          res.json({ token: newToken });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send({ error: "An error occurred" });
        });
    });
  });

router.post(
    "/api/forgot-password",
    validateForgotPassword,
    async (req, res) => {
        const { email } = req.body;
        const result = await pgClient.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(400).send({ error: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        redisClient.set(resetToken, user.username, { EX: 3600 });
        redisClient.set(resetToken, user.username, { EX: 3600 });

        await sendResetEmail(email, resetToken);

        res.send({ data: "Reset email sent" });
    }
);

router.post(
    "/api/reset-password/:token",
    validateResetPassword,
    async (req, res) => {
        const { token } = req.params;
        const { newPassword } = req.body;

        const username = await redisClient.get(token);
        if (!username) {
            return res.status(400).send({ error: "Invalid or expired token" });
        }

        const result = await pgClient.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(400).send({ error: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await pgClient.query(
            `UPDATE users SET password = $1 WHERE username = $2`,
            [hashedPassword, username]
        );

        await redisClient.del(token);

        res.send({ data: "Password reset successfully" });
    }
);

router.post("/api/validate-token", async (req, res) => {
    const token = req.body.token;

    const validToken = await redisClient.get(token);

    if (!validToken) {
        return res.status(400).send({ error: "Invalid or expired token" });
    }

    res.send({ data: "Token is valid" });
});

router.post("/api/remember-me", async (req, res) => {
    const { refreshToken, rememberMe } = req.body;

    try {
        await redisClient.set(
            `${refreshToken}:rememberMe`,
            rememberMe.toString()
        );
        res.status(200).send({ data: "Remember me set" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred" });
    }
});

router.delete("/api/logout", (req, res) => {
    redisClient.del(req.body.token);
    res.sendStatus(204);
});

export default router;
