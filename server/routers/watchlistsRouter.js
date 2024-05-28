import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

import authenticateToken from "../util/authenticateToken.js";

router.get("/api/watchlists/:user_id/:movie_id?", authenticateToken, async (req, res) => {
    try {
        const userId = req.params.user_id;
        const movieId = req.params.movie_id;

        let query;
        let queryParams;

        if (movieId) {
            query = `
                SELECT wm.movie_id, m.title
                FROM watchlist_movies wm
                JOIN movies m ON wm.movie_id = m.id
                WHERE wm.user_id = $1 AND wm.movie_id = $2;
            `;
            queryParams = [userId, movieId];
        } else {
            query = `
                SELECT wm.movie_id, m.title
                FROM watchlist_movies wm
                JOIN movies m ON wm.movie_id = m.id
                WHERE wm.user_id = $1;
            `;
            queryParams = [userId];
        }

        const result = await pgClient.query(query, queryParams);

        const watchlist = result.rows;

        if (watchlist.length === 0) {
            return res.status(404).send("No watchlist found");
        }

        const enrichedWatchlist = await Promise.all(
            watchlist.map(async (movie) => {
                const mongoData = await mongoClient.movies.findOne({
                    id: Number(movie.movie_id),
                });
                return {
                    ...movie,
                    poster_path: mongoData ? mongoData.posterPath : null,
                };
            })
        );

        res.json({ data: enrichedWatchlist });
    } catch (error) {
        console.error("Error getting watchlist:", error);
        res.status(500).send("Failed to get watchlist");
    }
});

router.post("/api/watchlists/:user_id", authenticateToken, async (req, res) => {
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
            return res.status(404).send("Movie not found");
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
        res.status(500).send("Failed to add movie to watchlist");
    }
});

router.delete("/api/watchlists/:user_id/:movie_id", authenticateToken, async (req, res) => {
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
            return res.status(404).send("Movie not found");
        }

        res.json({ data: movie });
    } catch (error) {
        console.error("Error removing movie from watchlist:", error);
        res.status(500).send("Failed to remove movie from watchlist");
    }
});

export default router;
