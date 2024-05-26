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

        const totalLogsQuery = "SELECT COUNT(*) FROM watch_logs";
        const totalLogsResult = await pgClient.query(totalLogsQuery);
        const totalLogs = totalLogsResult.rows[0].count;

        const totalPages = Math.ceil(totalLogs / limit);

        return {
            data: logs.rows,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1,
                next_page: page < totalPages ? page + 1 : null,
                previous_page: page > 1 ? page - 1 : null,
            },
        };
    } catch (error) {
        console.error("Failed to get logs:", error);
        return { data: [], pagination: {} };
    }
}

router.get("/api/logs", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const logs = await getAllLogs(page, limit);

    res.send(logs);
});

router.get("/api/logs/recent", async (req, res) => {
    try {
        const logs = await pgClient.query(
            `SELECT watch_logs.*, users.username, users.profile_picture, movies.title AS movie_title,
                    (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = watch_logs.id) AS total_likes
             FROM watch_logs
             INNER JOIN users ON watch_logs.user_id = users.id
             INNER JOIN movies ON watch_logs.movie_id = movies.id
             ORDER BY watch_logs.id DESC`
        );

        res.send({ data: logs.rows });
    } catch (error) {
        console.error("Failed to get recent logs:", error);
        res.status(500).send({
            error: "An error occurred while fetching recent logs.",
        });
    }
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

router.get("/api/logs/movie/:movie_id", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const movieId = req.params.movie_id;
    const result = await pgClient.query(
        `SELECT watch_logs.*, users.username 
         FROM watch_logs
         INNER JOIN users ON watch_logs.user_id = users.id
         WHERE movie_id = $1
         ORDER BY watch_logs.id DESC
         LIMIT $2 OFFSET $3`,
        [movieId, limit, offset]
    );

    if (result.rows.length === 0) {
        res.send({
            message: "No reviews found for this movie.",
        });
    } else {
        const totalLogs = await pgClient.query(
            "SELECT COUNT(*) FROM watch_logs WHERE movie_id = $1",
            [movieId]
        );

        const totalPages = Math.ceil(totalLogs.rows[0].count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        const response = {
            data: result.rows,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                has_next_page: hasNextPage,
                has_previous_page: hasPreviousPage,
                next_page: hasNextPage ? page + 1 : null,
                previous_page: hasPreviousPage ? page - 1 : null,
            },
        };

        res.send(response);
    }
});

router.get("/api/logs/movie/:movie_id/aggregated", async (req, res) => {
    try {
        const movieId = req.params.movie_id;

        const logsAggregation = await pgClient.query(`
            SELECT COUNT(DISTINCT user_id) AS total_unique_users,
                   COUNT(id) AS total_logs,
                   SUM(CASE WHEN review IS NOT NULL AND review <> '' THEN 1 ELSE 0 END) AS total_reviews,
                   SUM(CASE WHEN rating IS NOT NULL THEN 1 ELSE 0 END) AS total_ratings,
                   ROUND(AVG(rating), 2) AS average_rating,
                   MAX(rating) AS max_rating,
                   MIN(rating) AS min_rating
            FROM watch_logs
            WHERE movie_id = $1
        `, [movieId]);

        const watchlistCount = await pgClient.query(`
            SELECT COUNT(DISTINCT user_id) AS total_watchlist_users
            FROM watchlist_movies
            WHERE movie_id = $1
        `, [movieId]);

        const aggregatedData = {
            movie_id: movieId,
           ...logsAggregation.rows[0],
            total_watchlist_users: watchlistCount.rows[0].total_watchlist_users
        };

        res.send({ data: aggregatedData });
    } catch (error) {
        console.error('Query failed:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});



router.get("/api/logs/reviews/:movie_id", async (req, res) => {
    const movieId = req.params.movie_id;
    const result = await pgClient.query(
        `SELECT watch_logs.id, users.username, users.profile_picture, users.id AS user_id, watch_logs.watched_on, watch_logs.rating, watch_logs.review, watch_logs.created_at,
                (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = watch_logs.id) AS total_likes
         FROM watch_logs 
         INNER JOIN users ON watch_logs.user_id = users.id 
         WHERE watch_logs.movie_id = $1 AND watch_logs.review IS NOT NULL AND watch_logs.review <> ''`,
        [movieId]
    );

    if (result.rows.length === 0) {
        res.status(404).send({
            message: "No reviews found for this movie.",
        });
    } else {
        res.send({ data: result.rows });
    }
});


router.get("/api/logs/user/:user_id", async (req, res) => {
    const userId = req.params.user_id;
    const result = await pgClient.query(
        `WITH last_four_movies AS (
            SELECT movies.title, watch_logs.movie_id, watch_logs.rating, watch_logs.watched_on
            FROM watch_logs
            INNER JOIN movies ON watch_logs.movie_id = movies.id
            WHERE watch_logs.user_id = $1
            ORDER BY watch_logs.watched_on DESC
            LIMIT 4
        ), unique_movies_count AS (
            SELECT COUNT(DISTINCT watch_logs.movie_id) AS unique_movies_watched
            FROM watch_logs
            WHERE watch_logs.user_id = $1
        )
        SELECT last_four_movies.title, last_four_movies.movie_id, last_four_movies.rating, last_four_movies.watched_on, unique_movies_count.unique_movies_watched
        FROM last_four_movies
        CROSS JOIN unique_movies_count;`,
        [userId]
    );

    if (result.rows.length === 0) {
        res.status(404).send({
            message: "No logs found for this user.",
        });
    } else {
        const movieDetailsPromises = result.rows.map(async (row) => {
            const movieId = Number(row.movie_id);
            const movieDoc = await mongoClient.movies.findOne({ id: movieId });
            return {
                movie_id: movieId,
                title: row.title,
                rating: row.rating,
                watched_on: row.watched_on,
                poster_path: movieDoc.posterPath,
            };
        });

        const movieDetails = await Promise.all(movieDetailsPromises);

        const formattedResponse = {
            data: {
                unique_movies_watched: result.rows[0].unique_movies_watched,
                last_four: movieDetails.map((detail) => detail),
            },
        };

        res.send(formattedResponse);
    }
});

router.get("/api/logs/user/:user_id/watched", async (req, res) => {
    const userId = req.params.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const logsQuery = `
        SELECT DISTINCT ON (watch_logs.movie_id) watch_logs.id, movies.title, movies.id AS movie_id, movies.release_date, watch_logs.watched_on, watch_logs.rating, watch_logs.review, watch_logs.created_at, watch_logs.movie_id
        FROM watch_logs
        INNER JOIN movies ON watch_logs.movie_id = movies.id
        WHERE watch_logs.user_id = $1
        ORDER BY watch_logs.movie_id, watch_logs.created_at DESC
        LIMIT $2 OFFSET $3
    `;

    const logsResult = await pgClient.query(logsQuery, [userId, limit, offset]);

    const countQuery = `
        SELECT COUNT(DISTINCT watch_logs.movie_id)
        FROM watch_logs
        WHERE watch_logs.user_id = $1
    `;

    const countResult = await pgClient.query(countQuery, [userId]);
    const totalUniqueMovies = countResult.rows[0].count;
    const totalPages = Math.ceil(totalUniqueMovies / limit);

    if (logsResult.rows.length === 0) {
        res.status(404).send({
            message: "No logs found for this user.",
        });
    } else {
        const logDetailsPromises = logsResult.rows.map(async (row) => {
            const movieId = Number(row.movie_id);
            const movieDoc = await mongoClient.movies.findOne({ id: movieId });
            return {
                id: row.id,
                movie_id: movieId,
                title: row.title,
                release_date: row.release_date,
                watched_on: row.watched_on,
                rating: row.rating,
                review: row.review,
                created_at: row.created_at,
                poster_path: movieDoc ? movieDoc.posterPath : null,
            };
        });

        const logDetails = await Promise.all(logDetailsPromises);

        res.send({
            data: logDetails,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1,
                next_page: page < totalPages ? page + 1 : null,
                previous_page: page > 1 ? page - 1 : null,
            },
        });
    }
});

router.get("/api/logs/user/:user_id/reviews", async (req, res) => {
    const userId = req.params.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reviewsQuery = `
      SELECT watch_logs.id, movies.title, movies.id AS movie_id, movies.release_date, watch_logs.watched_on, watch_logs.rating, watch_logs.review, watch_logs.created_at, watch_logs.user_id,
             (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = watch_logs.id) AS total_likes
      FROM watch_logs
      INNER JOIN movies ON watch_logs.movie_id = movies.id
      WHERE watch_logs.user_id = $1 AND watch_logs.review IS NOT NULL AND watch_logs.review <> ''
      ORDER BY watch_logs.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const reviewsResult = await pgClient.query(reviewsQuery, [
        userId,
        limit,
        offset,
    ]);

    const countQuery = `
      SELECT COUNT(*)
      FROM watch_logs
      WHERE watch_logs.user_id = $1 AND watch_logs.review IS NOT NULL AND watch_logs.review <> ''
    `;

    const countResult = await pgClient.query(countQuery, [userId]);
    const totalReviews = countResult.rows[0].count;
    const totalPages = Math.ceil(totalReviews / limit);

    if (reviewsResult.rows.length === 0) {
        res.status(404).send({
            message: "No reviews found for this user.",
        });
    } else {
        const reviewDetailsPromises = reviewsResult.rows.map(async (row) => {
            const movieId = Number(row.movie_id);
            const movieDoc = await mongoClient.movies.findOne({ id: movieId });
            return {
                id: row.id,
                movie_id: movieId,
                title: row.title,
                release_date: row.release_date,
                watched_on: row.watched_on,
                rating: row.rating,
                review: row.review,
                created_at: row.created_at,
                poster_path: movieDoc ? movieDoc.posterPath : null,
                user_id: row.user_id,
                total_likes: row.total_likes
            };
        });

        const reviewDetails = await Promise.all(reviewDetailsPromises);

        res.send({
            data: reviewDetails,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1,
                next_page: page < totalPages ? page + 1 : null,
                previous_page: page > 1 ? page - 1 : null,
            },
        });
    }
});


router.post("/api/logs", async (req, res) => {
    const { movieId, userId, watchedOn, rating, review } = req.body;
    const currentDate = new Date().toISOString();

    try {
        const log = await pgClient.query(
            "INSERT INTO watch_logs (movie_id, user_id, watched_on, rating, review, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [movieId, userId, watchedOn, rating, review, currentDate]
        );

        const movieQuery = await pgClient.query(
            `SELECT title FROM movies WHERE id = $1`,
            [movieId]
        );
        const userQuery = await pgClient.query(
            `SELECT username FROM users WHERE id = $1`,
            [userId]
        );

        await mongoClient.activities.insertOne({
            movieId: movieId,
            username: userQuery.rows[0].username,
            title: movieQuery.rows[0].title,
            activityType: "watched",
            date: watchedOn,
            createdAt: currentDate,
        });

        const watchlistQuery = await pgClient.query(`SELECT * FROM watchlist_movies WHERE movie_id = $1 AND user_id = $2`, [movieId, userId]);

        if (watchlistQuery.rows.length > 0) {
            await pgClient.query(`DELETE FROM watchlist_movies WHERE movie_id = $1 AND user_id = $2`, [movieId, userId]);
        }

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
        await mongoClient.activities.updateOne(
            { movieId: movie_id },
            {
                $set: {
                    userId: user_id,
                    activityType: "watched",
                    date: watched_on,
                },
            },
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
