import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";
import { NotFoundError, InternalServerError } from "../util/errors.js";

const router = Router();

import authenticateToken from "../util/authenticateToken.js";

router.get(
    "/api/likes/:review_id",
    authenticateToken,
    async (req, res, next) => {
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
                return next(NotFoundError("No likes found for this review"));
            }

            res.json({ data: users });
        } catch (error) {
            console.error("Error getting likes for review:", error);
            next(InternalServerError("Failed to get likes for review"));
        }
    }
);

router.get(
    "/api/likes/:user_id/:review_id",
    authenticateToken,
    async (req, res, next) => {
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
            next(InternalServerError("Failed to check like"));
        }
    }
);

router.post("/api/likes", authenticateToken, async (req, res, next) => {
    const { userId, reviewId } = req.body;

    try {
        await pgClient.query(
            "INSERT INTO review_likes (user_id, review_id) VALUES ($1, $2)",
            [userId, reviewId]
        );
        const reviewOwnerQuery = await pgClient.query(
            `SELECT user_id FROM watch_logs WHERE id = $1`,
            [reviewId]
        );
        const reviewOwnerId = reviewOwnerQuery.rows[0].user_id;

        const likerQuery = await pgClient.query(
            `SELECT username, profile_picture FROM users WHERE id = $1`,
            [userId]
        );
        const liker = likerQuery.rows[0];

        const movieQuery = await pgClient.query(
            `SELECT movies.title FROM movies JOIN watch_logs ON movies.id = watch_logs.movie_id WHERE watch_logs.id = $1`,
            [reviewId]
        );
        const movieTitle = movieQuery.rows[0].title;

        await mongoClient.activities.insertOne({
            userId: reviewOwnerId,
            activityType: "like",
            reviewId: reviewId,
            date: new Date().toISOString(),
            liker: {
                id: userId,
                username: liker.username,
                profile_picture: liker.profile_picture,
            },
            movieTitle: movieTitle,
            read: false,
        });

        res.send({ data: "Like added" });
    } catch (error) {
        console.error("Error adding like:", error);
        next(InternalServerError("Failed to add like"));
    }
});

router.delete(
    "/api/likes/:user_id/:review_id",
    authenticateToken,
    async (req, res, next) => {
        const userId = req.params.user_id;
        const reviewId = req.params.review_id;

        try {
            await pgClient.query(
                "DELETE FROM review_likes WHERE user_id = $1 AND review_id = $2",
                [userId, reviewId]
            );

            await mongoClient.activities.deleteOne({
                "liker.id": userId,
                reviewId: reviewId,
                activityType: "like",
            });

            res.send({ data: "Like removed" });
        } catch (error) {
            console.error("Error removing like:", error);
            next(InternalServerError("Failed to remove like"));
        }
    }
);

export default router;
