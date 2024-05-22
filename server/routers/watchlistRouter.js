import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

router.get("/api/watchlist/:userId/:movieId?", async (req, res) => { 
    try {
        const userId = req.params.userId;
        const movieId = req.params.movieId;

        let query;
        let queryParams;

        if (movieId) {
            // If a movieId is provided, check if the movie is on the watchlist
            query = `
                SELECT wm.movie_id, m.title
                FROM watchlist_movies wm
                JOIN movies m ON wm.movie_id = m.id
                WHERE wm.user_id = $1 AND wm.movie_id = $2;
            `;
            queryParams = [userId, movieId];
        } else {
            // If no movieId is provided, return the entire watchlist
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

        const enrichedWatchlist = await Promise.all(watchlist.map(async (movie) => {
            const mongoData = await mongoClient.movies.findOne({ id: Number(movie.movie_id) });
            return {
                ...movie,
                poster_path: mongoData ? mongoData.posterPath : null
            };
        }));

        res.json({ data: enrichedWatchlist });
    }
    catch (error) {
        console.error("Error getting watchlist:", error);
        res.status(500).send("Failed to get watchlist");
    }
});

router.post("/api/watchlist/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
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

        res.status(201).json({ data: movie }); 
    } catch (error) {
        console.error("Error adding movie to watchlist:", error);
        res.status(500).send("Failed to add movie to watchlist");
    }
});


router.delete("/api/watchlist/:userId/:movieId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const movieId = req.params.movieId;

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
    }
    catch (error) {
        console.error("Error removing movie from watchlist:", error);
        res.status(500).send("Failed to remove movie from watchlist");
    }
});

export default router;