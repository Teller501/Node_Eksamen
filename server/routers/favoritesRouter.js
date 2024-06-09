import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import {
    NotFoundError,
    BadRequestError,
    InternalServerError,
} from "../util/errors.js";

const router = Router();

import authenticateToken from "../util/authenticateToken.js";

router.get("/api/favorites", authenticateToken, async (req, res, next) => {
    try {
        const query = "SELECT * FROM favorite_movies";
        const result = await pgClient.query(query);

        const favorites = result.rows;

        if (favorites.length === 0) {
            return next(NotFoundError("No favorites found"));
        }

        res.json({ data: favorites });
    } catch (error) {
        console.error("Error getting favorites:", error);
        next(InternalServerError("Failed to get favorites"));
    }
});

router.get(
    "/api/favorites/:user_id",
    authenticateToken,
    async (req, res, next) => {
        try {
            const userId = req.params.user_id;
            const favoritesQuery = `
            SELECT fm.movie_id, fm.user_id, m.title, m.poster_path
            FROM favorite_movies fm
            JOIN movies m ON fm.movie_id = m.id
            WHERE fm.user_id = $1;
        `;
            const favoritesResult = await pgClient.query(favoritesQuery, [
                userId,
            ]);

            const favorites = favoritesResult.rows;

            if (favorites.length === 0) {
                return next(NotFoundError("No favorites found"));
            }

            res.json({ data: favorites });
        } catch (error) {
            console.error("Error getting favorites:", error);
            next(InternalServerError("Failed to get favorites"));
        }
    }
);

router.post("/api/favorites", authenticateToken, async (req, res, next) => {
    try {
        const { userId, movieId } = req.body;

        const existsQuery = `
            SELECT * FROM favorite_movies WHERE user_id = $1 AND movie_id = $2;
        `;
        const existsResult = await pgClient.query(existsQuery, [
            userId,
            movieId,
        ]);
        if (existsResult.rowCount > 0) {
            return next(BadRequestError("Movie is already in favorites"));
        }

        const countQuery = `
            SELECT COUNT(*) FROM favorite_movies WHERE user_id = $1;
        `;
        const countResult = await pgClient.query(countQuery, [userId]);
        if (parseInt(countResult.rows[0].count, 10) >= 4) {
            return next(BadRequestError("User already has 4 favorites"));
        }

        const insertQuery = `
            INSERT INTO favorite_movies (user_id, movie_id) VALUES ($1, $2) RETURNING *;
        `;
        const result = await pgClient.query(insertQuery, [userId, movieId]);
        const favorite = result.rows[0];

        const movieQuery = `
            SELECT title, poster_path FROM movies WHERE id = $1;
        `;
        const movieResult = await pgClient.query(movieQuery, [movieId]);
        const movie = movieResult.rows[0];

        favorite.poster_path = movie ? movie.poster_path : null;
        favorite.title = movie ? movie.title : null;

        res.json({ data: favorite });
    } catch (error) {
        console.error("Error adding favorite:", error);
        next(InternalServerError("Failed to add favorite"));
    }
});

router.delete(
    "/api/favorites/:user_id/:movie_id",
    authenticateToken,
    async (req, res, next) => {
        try {
            const userId = req.params.user_id;
            const movieId = req.params.movie_id;

            const deleteQuery = `DELETE FROM favorite_movies WHERE user_id = $1 AND movie_id = $2 RETURNING *;`;
            const result = await pgClient.query(deleteQuery, [userId, movieId]);
            const favorite = result.rows[0];

            if (!favorite) {
                return next(NotFoundError("Favorite not found"));
            }

            res.json({ data: favorite });
        } catch (error) {
            console.error("Error deleting favorite:", error);
            next(InternalServerError("Failed to delete favorite"));
        }
    }
);

export default router;
