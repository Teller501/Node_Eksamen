import "dotenv/config";
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
import {
    NotFoundError,
    BadRequestError,
    InternalServerError,
} from "../util/errors.js";

const router = Router();

import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL;

const saltRounds = 14;

function generateAccessToken(user, rememberMe = false) {
    return jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: rememberMe ? "7d" : "30m",
    });
}

async function sendActivationEmail(email, activationToken) {
    const activationLink = `${FRONTEND_URL}/activate/${activationToken}`;
    const message = {
        from: `Admin <noreply@${process.env.MAIL_DOMAIN}>`,
        to: email,
        subject: "Please activate your account",
        html: `<p>Thank you for signing up at Mandatory II! Please click the link below to activate your account:</p>
        <a href="${activationLink}">Activate account</a>`,
    };

    const { error } = await resend.emails.send(message);

    if (error) {
        console.error(error);
    }
}

async function sendResetEmail(email, resetToken) {
    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
    const message = {
        from: `Admin <noreply@${process.env.MAIL_DOMAIN}>`,
        to: email,
        subject: "Reset your password",
        html: `<p>You've requrested to resest your password, please click the link below to reset:</p>
        <a href="${resetLink}">Reset password</a>`,
    };

    const { error } = await resend.emails.send(message);

    if (error) {
        console.error(error);
    }
}

router.get("/api/activate/:token", validateToken, async (req, res, next) => {
    const token = req.params.token;
    const username = await redisClient.get(token);

    if (!username) {
        return next(NotFoundError("Invalid or expired token"));
    }

    const user = pgClient.query(`SELECT * FROM users WHERE username = $1`, [
        username,
    ]);
    if (!user) {
        return next(NotFoundError("User not found"));
    }

    await pgClient.query(
        `UPDATE users SET is_active = TRUE WHERE username = $1`,
        [username]
    );
    await redisClient.del(token);

    res.send({ data: "User activated" });
});

router.get("/api/check-username/:username", async (req, res) => {
    const { username } = req.params;
    const result = await pgClient.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
    );

    if (result.rowCount > 0) {
        return res.status(200).send({ data: false });
    }

    res.status(200).send({ data: true });
});

router.post("/api/login", validateUserLogin, async (req, res, next) => {
    try {
        const result = await pgClient.query(
            `SELECT * FROM users WHERE username = $1`,
            [req.body.username]
        );

        if (result.rowCount === 0) {
            return next(NotFoundError("User not found"));
        }

        const user = result.rows[0];
        const rememberMe = req.body.rememberMe;

        if (!user.is_active) {
            return next(BadRequestError("User not activated"));
        }

        if (await bcrypt.compare(req.body.password, user.password)) {
            const followCountsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM user_follows WHERE followed_id = $1) AS followers_count,
                    (SELECT COUNT(*) FROM user_follows WHERE follower_id = $1) AS following_count
            `;
            const followCountsResult = await pgClient.query(followCountsQuery, [
                user.id,
            ]);
            const { followers_count, following_count } =
                followCountsResult.rows[0];

            user.followers_count = followers_count;
            user.following_count = following_count;

            const token = generateAccessToken(user, rememberMe);
            const refreshToken = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_REFRESH_SECRET
            );

            if (rememberMe) {
                await redisClient.set(refreshToken, user.username, {
                    EX: 604800,
                });
            } else {
                await redisClient.set(refreshToken, user.username, {
                    EX: 1800,
                });
            }

            res.send({ token, refreshToken, user });
        } else {
            return next(BadRequestError("Invalid password"));
        }
    } catch (error) {
        console.error("Error during login:", error);
        next(InternalServerError("An error occurred during login"));
    }
});

router.post("/api/signup", validateUserSignup, async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            isActive: false,
        };
        const activationToken = crypto.randomBytes(32).toString("hex");

        await pgClient.query(
            `INSERT INTO users (username, email, password, is_active) VALUES ($1, $2, $3, $4) `,
            [user.username, user.email, user.password, user.isActive]
        );
        await redisClient.set(activationToken, user.username, { EX: 3600 });

        await sendActivationEmail(user.email, activationToken);

        res.status(201).send({ data: "User created" });
    } catch (error) {
        console.error(error);
        next(InternalServerError("An error occurred during signup"));
    }
});

router.post("/api/token", validateToken, async (req, res, next) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return next(BadRequestError("No token provided"));

    const foundToken = await redisClient.get(refreshToken);
    if (!foundToken) return next(NotFoundError("Token not found"));

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return next(BadRequestError("Invalid token"));

        pgClient
            .query(`SELECT is_active FROM users WHERE username = $1`, [
                user.username,
            ])
            .then(async (result) => {
                const isActive = result.rows[0].is_active;
                const rememberMeFlag = await redisClient.get(
                    `${refreshToken}:rememberMe`
                );

                if (!isActive) {
                    return next(BadRequestError("User not activated"));
                }

                const newToken = generateAccessToken({
                    username: user.username,
                });

                const expirationTime =
                    rememberMeFlag === "true" ? 604800 : 1800;
                await redisClient.set(refreshToken, user.username, {
                    EX: expirationTime,
                });

                res.json({ token: newToken });
            })
            .catch((err) => {
                console.error(err);
                next(InternalServerError("An error occurred"));
            });
    });
});

router.post("/api/forgot-password", validateForgotPassword, async (req, res, next) => {
        const { email } = req.body;
        const result = await pgClient.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return next(NotFoundError("User not found"));
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        redisClient.set(resetToken, user.username, { EX: 3600 });
        redisClient.set(resetToken, user.username, { EX: 3600 });

        await sendResetEmail(email, resetToken);

        res.send({ data: "Reset email sent" });
    }
);

router.post("/api/reset-password/:token", validateResetPassword, async (req, res, next) => {
        const { token } = req.params;
        const { newPassword } = req.body;

        const username = await redisClient.get(token);
        if (!username) {
            return next(NotFoundError("Invalid or expired token"));
        }

        const result = await pgClient.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return next(NotFoundError("User not found"));
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

router.post("/api/validate-token", async (req, res, next) => {
    const token = req.body.token;

    const validToken = await redisClient.get(token);

    if (!validToken) {
        return next(NotFoundError("Invalid or expired token"));
    }

    res.send({ data: "Token is valid" });
});

router.post("/api/remember-me", async (req, res, next) => {
    const { refreshToken, rememberMe } = req.body;

    try {
        await redisClient.set(
            `${refreshToken}:rememberMe`,
            rememberMe.toString(),
            { EX: 604800 }
        );
        res.status(200).send({ data: "Remember me set" });
    } catch (error) {
        console.error(error);
        next(InternalServerError("An error occurred"));
    }
});

router.post("/api/change-password", async (req, res, next) => {
    const { username, currentPassword, newPassword } = req.body;

    try {
        const result = await pgClient.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return next(NotFoundError("User not found"));
        }

        if (await bcrypt.compare(currentPassword, user.password)) {
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await pgClient.query(
                `UPDATE users SET password = $1 WHERE username = $2`,
                [hashedPassword, username]
            );

            res.send({ data: "Password changed" });
        } else {
            return next(BadRequestError("Invalid password"));
        }
    } catch (error) {
        console.error(error);
        next(InternalServerError("An error occurred"));
    }
});

router.delete("/api/logout/:token", (req, res) => {
    redisClient.del(req.params.token);
    res.send({ data: "Logged out" });
});

export default router;
