import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";
import { NotFoundError, BadRequestError, InternalServerError } from '../util/errors.js';

const router = Router();

import authenticateToken from "../util/authenticateToken.js";

router.get("/api/lists/search", authenticateToken, async (req, res, next) => {
    const q = req.query.q;
    if (!q) {
        return next(BadRequestError("Missing query parameter 'q'"));
    }

    try {
        const query = `
            SELECT uml.*, u.username, u.profile_picture, COUNT(mli.movie_id) as movie_count
            FROM user_movie_lists uml
            JOIN users u ON uml.user_id = u.id
            LEFT JOIN movie_list_items mli ON uml.id = mli.list_id
            WHERE uml.list_name ILIKE $1
            GROUP BY uml.id, u.id;
        `;
        const result = await pgClient.query(query, [`%${q}%`]);

        if (result.rows.length === 0) {
            return next(NotFoundError("No lists found"));
        }

        res.send({ data: result.rows });
    } catch (error) {
        console.error("Error searching lists:", error);
        next(InternalServerError("Failed to search lists"));
    }
});

router.get("/api/lists/:user_id", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.params.user_id;

        const query = `
            SELECT uml.*, u.username, u.profile_picture, COUNT(mli.movie_id) as movie_count
            FROM user_movie_lists uml
            JOIN users u ON uml.user_id = u.id
            LEFT JOIN movie_list_items mli ON uml.id = mli.list_id
            WHERE uml.user_id = $1
            GROUP BY uml.id, u.id;
        `;
        const result = await pgClient.query(query, [userId]);

        if (result.rows.length === 0) {
            return next(NotFoundError("No lists found"));
        }

        res.send({ data: result.rows });
    } catch (error) {
        console.error("Error getting lists:", error);
        next(InternalServerError("Failed to get lists"));
    }
});

router.get("/api/lists/:user_id/:list_id", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.params.user_id;
        const listId = req.params.list_id;

        const listQuery = await pgClient.query(
            `
            SELECT uml.*, u.username, u.profile_picture, COUNT(mli.movie_id) as movie_count
            FROM user_movie_lists uml
            JOIN users u ON uml.user_id = u.id
            LEFT JOIN movie_list_items mli ON uml.id = mli.list_id
            WHERE uml.id = $1 AND uml.user_id = $2
            GROUP BY uml.id, u.id;
            `,
            [listId, userId]
        );

        if (listQuery.rows.length === 0) {
            return next(NotFoundError("List not found"));
        }

        const movieQuery = await pgClient.query(
            `
            SELECT m.id as movie_id, m.title, m.original_title, m.overview
            FROM movie_list_items li
            JOIN movies m ON li.movie_id = m.id
            WHERE li.list_id = $1;
            `,
            [listId]
        );

        const list = listQuery.rows[0];
        list.movies = movieQuery.rows;

        const enrichedMovies = await Promise.all(
            list.movies.map(async (movie) => {
                const mongoData = await mongoClient.movies.findOne({
                    id: Number(movie.movie_id),
                });
                return {
                    ...movie,
                    poster_path: mongoData ? mongoData.posterPath : null,
                };
            })
        );

        list.movies = enrichedMovies;

        res.send({ data: list });
    } catch (error) {
        console.error("Error getting list details:", error);
        next(InternalServerError("Failed to get list details"));
    }
});

router.post("/api/lists/:user_id", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.params.user_id;
        const { listName, description } = req.body;

        const query = `
            INSERT INTO user_movie_lists (user_id, list_name, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await pgClient.query(query, [userId, listName, description]);

        const usernameQuery = await pgClient.query(`SELECT username FROM users WHERE id = $1`, [userId]);
        result.rows[0].username = usernameQuery.rows[0].username;


        res.status(201).send({ data: result.rows[0] });
    } catch (error) {
        console.error("Error creating list:", error);
        next(InternalServerError("Failed to create list"));
    }
});

router.post("/api/lists/:user_id/:list_id", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.params.user_id;
        const listId = req.params.list_id;
        const { movieId } = req.body;

        const listQuery = await pgClient.query(
            `SELECT * FROM user_movie_lists WHERE id = $1 AND user_id = $2`,
            [listId, userId]
        );
        if (listQuery.rows.length === 0) {
            return res.status(404).send("List not found");
        }

        const query = `
            INSERT INTO movie_list_items (list_id, movie_id)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await pgClient.query(query, [listId, movieId]);

        res.status(201).send({ data: result.rows[0] });
    } catch (error) {
        console.error("Error adding movie to list:", error);
        next(InternalServerError("Failed to add movie to list"));
    }
});


router.delete("/api/lists/:user_id/:list_id", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.params.user_id;
        const listId = req.params.list_id;

        const deleteItemsQuery = `
            DELETE FROM movie_list_items
            WHERE list_id = $1;
        `;
        await pgClient.query(deleteItemsQuery, [listId]);

        const deleteListQuery = `
            DELETE FROM user_movie_lists
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `;
        const result = await pgClient.query(deleteListQuery, [listId, userId]);

        if (result.rows.length === 0) {
            return next(NotFoundError("List not found"));
        }

        res.send({ data: result.rows[0] });
    } catch (error) {
        console.error("Error deleting list:", error);
        next(InternalServerError("Failed to delete list"));
    }
});

router.delete("/api/lists/:user_id/:list_id/:movie_id", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.params.user_id;
        const listId = req.params.list_id;
        const movieId = req.params.movie_id;

        const listQuery = await pgClient.query(
            `SELECT * FROM user_movie_lists WHERE id = $1 AND user_id = $2`,
            [listId, userId]
        );
        if (listQuery.rows.length === 0) {
            return res.status(404).send("List not found");
        }

        const query = `
            DELETE FROM movie_list_items
            WHERE list_id = $1 AND movie_id = $2
            RETURNING *;
        `;
        const result = await pgClient.query(query, [listId, movieId]);

        if (result.rows.length === 0) {
            return next(NotFoundError("Movie not found in list"));
        }

        res.send({ data: result.rows[0] });
    } catch (error) {
        console.error("Error deleting movie from list:", error);
        next(InternalServerError("Failed to delete movie from list"));
    }
});

export default router;
