import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

router.get("/api/lists/:user_id", async (req, res) => {
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
            return res.status(404).send("No lists found");
        }

        res.json({ data: result.rows });
    } catch (error) {
        console.error("Error getting lists:", error);
        res.status(500).send("Failed to get lists");
    }
});

// Retrieve a specific list with its movies
router.get("/api/lists/:user_id/:list_id", async (req, res) => {
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
            return res.status(404).send("List not found");
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

        res.json({ data: list });
    } catch (error) {
        console.error("Error getting list details:", error);
        res.status(500).send("Failed to get list details");
    }
});

// Create a new list
router.post("/api/lists/:user_id", async (req, res) => {
    try {
        const userId = req.params.user_id;
        const { listName, description } = req.body;

        const query = `
            INSERT INTO user_movie_lists (user_id, list_name, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await pgClient.query(query, [userId, listName, description]);

        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        console.error("Error creating list:", error);
        res.status(500).send("Failed to create list");
    }
});

// Add movie to list
router.post("/api/lists/:user_id/:list_id", async (req, res) => {
    try {
        const userId = req.params.user_id;
        const listId = req.params.list_id;
        const { movieId } = req.body;

        // Check if the list belongs to the user
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

        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        console.error("Error adding movie to list:", error);
        res.status(500).send("Failed to add movie to list");
    }
});


// Delete a list
router.delete("/api/lists/:user_id/:list_id", async (req, res) => {
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
            return res.status(404).send("List not found");
        }

        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error("Error deleting list:", error);
        res.status(500).send("Failed to delete list");
    }
});

// Delete a specific movie from a specific list
router.delete("/api/lists/:user_id/:list_id/:movie_id", async (req, res) => {
    try {
        const userId = req.params.user_id;
        const listId = req.params.list_id;
        const movieId = req.params.movie_id;

        // Check if the list belongs to the user
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
            return res.status(404).send("Movie not found in the list");
        }

        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error("Error deleting movie from list:", error);
        res.status(500).send("Failed to delete movie from list");
    }
});

export default router;
