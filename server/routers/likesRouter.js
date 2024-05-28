import { Router } from "express";
import pgClient from "../database/pgConnection.js";

const router = Router();

import authenticateToken from "../util/authenticateToken.js";

router.get("/api/likes/:review_id", authenticateToken, async (req, res) => {
    const reviewId = req.params.review_id;

    try {
        const query = `
            SELECT u.id, u.username, u.profile_picture
            FROM users u
            JOIN review_likes rl ON u.id = rl.user_id
            WHERE rl.review_id = $1
        `;
        const result = await pgClient.query(query, [reviewId]);

        const users = result.rows;

        if (users.length === 0) {
            return res.status(404).send({ message: "No likes found for this review." });
        }

        res.json({ data: users });
    } catch (error) {
        console.error("Error getting likes for review:", error);
        res.status(500).send("Failed to get likes for review");
    }
});

router.get("/api/likes/:user_id/:review_id", authenticateToken, async (req, res) => {
    const { user_id, review_id } = req.params;

    try {
        const query = `
            SELECT 1 FROM review_likes
            WHERE user_id = $1 AND review_id = $2
        `;
        const result = await pgClient.query(query, [user_id, review_id]);

        if (result.rowCount > 0) {
            res.json({ data: true });
        } else {
            res.json({ data: false });
        }
    } catch (error) {
        console.error("Error checking like:", error);
        res.status(500).send("Failed to check like");
    }
});

router.post("/api/likes", authenticateToken, async (req, res) => {
    const { userId, reviewId } = req.body;

    try {
        await pgClient.query(
            "INSERT INTO review_likes (user_id, review_id) VALUES ($1, $2)",
            [userId, reviewId]
        );

        res.send({ data: "Like added" });
    } catch (error) {
        console.error("Error adding like:", error);
        res.status(500).send({ error: "Failed to add like" });
    }
});

router.delete("/api/likes/:user_id/:review_id", authenticateToken, async (req, res) => {
    const userId = req.params.user_id;
    const reviewId = req.params.review_id;

    try {
        await pgClient.query(
            "DELETE FROM review_likes WHERE user_id = $1 AND review_id = $2",
            [userId, reviewId]
        );

        res.send({ data: "Like removed" });
    } catch (error) {
        console.error("Error removing like:", error);
        res.status(500).send({ error: "Failed to remove like" });
    }
});

export default router;
