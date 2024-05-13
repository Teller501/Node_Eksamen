import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

async function getAllLogs(page = 1, limit = 10) {
    try {
        const query = `
            SELECT * FROM watch_logs
            ORDER BY id DESC
            LIMIT $1 OFFSET $2
        `;
        const params = [limit, (page - 1) * limit];
        const logs = await pgClient.query(query, params);
        return logs.rows;
    } catch (error) {
        console.error("Failed to get logs:", error);
        return [];
    }
}

router.get("/api/logs", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const logs = await getAllLogs(page, limit);

    res.send({ data: logs });
});

router.get("/api/logs/:id", async (req, res) => {
    const id = req.params.id;
    const log = await pgClient.query("SELECT * FROM watch_logs WHERE id = $1", [
        id,
    ]);

    if (log.rows.length === 0) {
        return res.status(404).send({ message: "Log not found" });
    }

    res.send({ data: log.rows[0] });
});

router.get("/api/logs/movie/:movieId", async (req, res) => {
    const movieId = req.params.movieId;
    const result = await pgClient.query(
        "SELECT movie_id, COUNT(*) AS watch_count, AVG(rating) AS average_rating FROM watch_logs WHERE movie_id = $1 GROUP BY movie_id",
        [movieId]
    );

    if (result.rows.length === 0) {
        res.send({
            data: { movie_id: movieId, watch_count: 0, average_rating: null },
        });
    } else {
        res.send({ data: result.rows[0] });
    }
});

router.post("/api/logs", async (req, res) => {
    const { movie_id, user_id, watched_on, rating, review } = req.body;

    try {
        const log = await pgClient.query(
            "INSERT INTO watch_logs (movie_id, user_id, watched_on, rating, review) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [movie_id, user_id, watched_on, rating, review]
        );

        await mongoClient.activity.updateOne(
            { movieId: movie_id },
            { $set: { userId: user_id, activityType: "watched", date: watched_on } },
            { upsert: true }
        );

        res.send({ data: log.rows[0] });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).send({
            error: "An error occurred while inserting the log.",
        });
    }
});

router.patch("/api/logs/:id", async (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");

    const values = Object.values(updates);
    values.push(id);

    try {
        const log = await pgClient.query(
            `UPDATE watch_logs SET ${setClause} WHERE id = $${values.length} RETURNING *`,
            values
        );

        if (log.rows.length === 0) {
            return res.status(404).send({ message: "Log not found" });
        }

        const { movie_id, user_id, watched_on } = updates;
        await mongoClient.activity.updateOne(
            { movieId: movie_id },
            { $set: { userId: user_id, activityType: "watched", date: watched_on } },
            { upsert: true }
        );

        res.send({ data: log.rows[0] });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).send({
            error: "An error occurred while updating the log.",
        });
    }
});


router.delete("/api/logs/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const log = await pgClient.query(
            "DELETE FROM watch_logs WHERE id = $1 RETURNING *",
            [id]
        );

        if (log.rows.length === 0) {
            return res.status(404).send({ message: "Log not found" });
        }

        res.send({ data: log.rows[0] });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).send({
            error: "An error occurred while deleting the log.",
        });
    }
});

export default router;
