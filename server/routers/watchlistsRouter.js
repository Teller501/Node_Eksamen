import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

import authenticateToken from "../util/authenticateToken.js";
import {
    NotFoundError,
    BadRequestError,
    InternalServerError,
} from "../util/errors.js";

router.get("/api/watchlists/:user_id/:movie_id?", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.params.user_id;
        const movieId = req.params.movie_id;

        let query;
        let queryParams;

        if (movieId) {
            query = `
                SELECT wm.movie_id, m.title, m.poster_path
                FROM watchlist_movies wm
                JOIN movies m ON wm.movie_id = m.id
                WHERE wm.user_id = $1 AND wm.movie_id = $2;
            `;
            queryParams = [userId, movieId];
        } else {
            query = `
                SELECT wm.movie_id, m.title, m.poster_path
                FROM watchlist_movies wm
                JOIN movies m ON wm.movie_id = m.id
                WHERE wm.user_id = $1;
            `;
            queryParams = [userId];
        }

        const result = await pgClient.query(query, queryParams);

        const watchlist = result.rows;

        if (watchlist.length === 0) {
            return next(NotFoundError("No watchlist found"));
        }

        res.json({ data: watchlist });
    } catch (error) {
        console.error("Error getting watchlist:", error);
        next(InternalServerError("Failed to get watchlist"));
    }
});

router.post("/api/watchlists/:user_id", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.params.user_id;
        const { movieId } = req.body;

        const query = `
            INSERT INTO watchlist_movies (user_id, movie_id)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await pgClient.query(query, [userId, movieId]);

        const movie = result.rows[0];
        if (!movie) {
            return next(NotFoundError("Movie not found"));
        }

        const movieQuery = await pgClient.query(
            `SELECT title FROM movies WHERE id = $1`,
            [movieId]
        );
        const userQuery = await pgClient.query(
            `SELECT username FROM users WHERE id = $1`,
            [userId]
        );

        const currentDate = new Date().toISOString();

        await mongoClient.activities.insertOne({
            movieId,
            username: userQuery.rows[0].username,
            title: movieQuery.rows[0].title,
            activityType: "watchlist",
            createdAt: currentDate,
        });

        res.status(201).json({ data: movie });
    } catch (error) {
        console.error("Error adding movie to watchlist:", error);
        next(InternalServerError("Failed to add movie to watchlist"));
    }
});

router.delete("/api/watchlists/:user_id/:movie_id", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.params.user_id;
        const movieId = req.params.movie_id;

        const query = `
            DELETE FROM watchlist_movies
            WHERE user_id = $1 AND movie_id = $2
            RETURNING *;
        `;
        const result = await pgClient.query(query, [userId, movieId]);

        const movie = result.rows[0];
        if (!movie) {
            return next(NotFoundError("Movie not found in watchlist"));
        }

        res.json({ data: movie });
    } catch (error) {
        console.error("Error removing movie from watchlist:", error);
        next(InternalServerError("Failed to remove movie from watchlist"));
    }
});

export default router;
