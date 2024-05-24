import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

router.get("/api/favorites", async (req, res) => { 
    try {
        const query = "SELECT * FROM favorite_movies";
        const result = await pgClient.query(query);

        const favorites = result.rows;

        if (favorites.length === 0) {
            return res.status(404).send({ data: "No favorites found" });
        }

        res.json({ data: favorites });
    } catch (error) {
        console.error("Error getting favorites:", error);
        res.status(500).send("Failed to get favorites");
    }
});

router.get("/api/favorites/:user_id", async (req, res) => {
    try {
        const userId = req.params.user_id;
        const favoritesQuery = `
            SELECT fm.movie_id, fm.user_id, m.title
            FROM favorite_movies fm
            JOIN movies m ON fm.movie_id = m.id
            WHERE fm.user_id = $1;
        `;
        const favoritesResult = await pgClient.query(favoritesQuery, [userId]);

        const favorites = favoritesResult.rows;

        if (favorites.length === 0) {
            return res.status(404).send("No favorites found");
        }

        const enrichedFavorites = await Promise.all(favorites.map(async (favorite) => {
            const mongoData = await mongoClient.movies.findOne({ id: Number(favorite.movie_id) });
            return {
                ...favorite,
                poster_path: mongoData ? mongoData.posterPath : null
            };
        }));

        res.json({ data: enrichedFavorites });
    } catch (error) {
        console.error("Error getting favorites:", error);
        res.status(500).send("Failed to get favorites");
    }
});



router.post("/api/favorites", async (req, res) => {
    try {
        const { userId, movieId } = req.body;

        const existsQuery = `
            SELECT * FROM favorite_movies WHERE user_id = $1 AND movie_id = $2;
        `;
        const existsResult = await pgClient.query(existsQuery, [userId, movieId]);
        if (existsResult.rowCount > 0) {
            return res.status(400).send({ error: "This movie is already in your favorites." });
        }

        const countQuery = `
            SELECT COUNT(*) FROM favorite_movies WHERE user_id = $1;
        `;
        const countResult = await pgClient.query(countQuery, [userId]);
        if (parseInt(countResult.rows[0].count, 10) >= 4) {
            return res.status(400).send({ error: "You can only have up to four favorites." });
        }

        const insertQuery = `
            INSERT INTO favorite_movies (user_id, movie_id) VALUES ($1, $2) RETURNING *;
        `;
        const result = await pgClient.query(insertQuery, [userId, movieId]);
        const favorite = result.rows[0];

        const mongoData = await mongoClient.movies.findOne({ id: Number(movieId) });

        favorite.poster_path = mongoData ? mongoData.posterPath : null;
        favorite.title = mongoData ? mongoData.title : null;

        res.json({ data: favorite });
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).send("Failed to add favorite");
    }
});

router.delete("/api/favorites/:user_id/:movie_id", async (req, res) => {
    try {
        const userId = req.params.user_id;
        const movieId = req.params.movie_id;

        const deleteQuery = `DELETE FROM favorite_movies WHERE user_id = $1 AND movie_id = $2 RETURNING *;`;
        const result = await pgClient.query(deleteQuery, [userId, movieId]);
        const favorite = result.rows[0];

        if (!favorite) {
            return res.status(404).send({ error: "Favorite not found" });
        }

        res.json({ data: favorite });
    } catch (error) {
        console.error("Error deleting favorite:", error);
        res.status(500).send("Failed to delete favorite");
    }
});



export default router;