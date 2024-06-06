import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";
import {
    NotFoundError,
    BadRequestError,
    InternalServerError,
} from "../util/errors.js";

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

import authenticateToken from "../util/authenticateToken.js";

router.get("/api/logs", authenticateToken, async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const logs = await getAllLogs(page, limit);

    if (logs.data.length === 0) {
        return next(NotFoundError("No logs found"));
    }

    res.send(logs);
});

router.get("/api/logs/recent", authenticateToken, async (req, res, next) => {
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
        next(InternalServerError("Failed to get recent logs"));
    }
});

router.get("/api/logs/:id", authenticateToken, async (req, res, next) => {
    const id = req.params.id;
    const log = await pgClient.query("SELECT * FROM watch_logs WHERE id = $1", [
        id,
    ]);

    if (log.rows.length === 0) {
        return next(NotFoundError("Log not found"));
    }

    res.send({ data: log.rows[0] });
});

router.get("/api/logs/movie/:movie_id", authenticateToken, async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const movieId = req.params.movie_id;
        try {
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
                return next(NotFoundError("No logs found for this movie"));
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
        } catch (error) {
            console.error("Failed to get logs for movie:", error);
            next(InternalServerError("Failed to get logs for movie"));
        }
    }
);

router.get("/api/logs/movie/:movie_id/aggregated", authenticateToken, async (req, res, next) => {
        const movieId = req.params.movie_id;
        try {
            const logsAggregation = await pgClient.query(
                `
                    SELECT COUNT(DISTINCT user_id) AS total_unique_users,
                   COUNT(id) AS total_logs,
                   SUM(CASE WHEN review IS NOT NULL AND review <> '' THEN 1 ELSE 0 END) AS total_reviews,
                   SUM(CASE WHEN rating IS NOT NULL THEN 1 ELSE 0 END) AS total_ratings,
                   ROUND(AVG(rating), 2) AS average_rating,
                   MAX(rating) AS max_rating,
                   MIN(rating) AS min_rating
                    FROM watch_logs
                    WHERE movie_id = $1
                 `,
                [movieId]
            );

            const watchlistCount = await pgClient.query(
                `
                    SELECT COUNT(DISTINCT user_id) AS total_watchlist_users
                    FROM watchlist_movies
                    WHERE movie_id = $1
                `,
                [movieId]
            );

            const aggregatedData = {
                movie_id: movieId,
                ...logsAggregation.rows[0],
                total_watchlist_users:
                    watchlistCount.rows[0].total_watchlist_users,
            };

            res.send({ data: aggregatedData });
        } catch (error) {
            console.error("Query failed:", error);
            next(InternalServerError("Failed to get aggregated logs"));
        }
    }
);

router.get("/api/logs/reviews/recent", authenticateToken, async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 15;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await pgClient.query(
            `SELECT watch_logs.*, users.username, users.id AS user_id, users.profile_picture, movies.title AS title, movies.release_date, movies.poster_path,
                (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = watch_logs.id) AS total_likes
            FROM watch_logs
            INNER JOIN users ON watch_logs.user_id = users.id
            INNER JOIN movies ON watch_logs.movie_id = movies.id
            WHERE review IS NOT NULL AND review <> ''
            ORDER BY total_likes DESC, watch_logs.id DESC
            LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const total_reviews = await pgClient.query(
            `SELECT COUNT(*) FROM watch_logs WHERE review IS NOT NULL AND review <> ''`
        );
        const total_pages = Math.ceil(total_reviews.rows[0].count / limit);

        if (result.rows.length === 0) {
            return next(NotFoundError("No reviews found"));
        } else {
            const response = result.rows.map(row => ({
                id: row.id,
                user_id: row.user_id,
                movie_id: row.movie_id,
                title: row.title,
                watched_on: row.watched_on,
                release_date: row.release_date,
                rating: row.rating,
                review: row.review,
                created_at: row.created_at,
                username: row.username,
                profile_picture: row.profile_picture,
                poster_path: row.poster_path,
                total_likes: row.total_likes,
            }));

            res.send({
                data: response,
                pagination: {
                    total_reviews: total_reviews.rows[0].count,
                    total_pages: total_pages,
                    current_page: Math.floor(offset / limit) + 1,
                },
            });
        }
    } catch (error) {
        console.error("Failed to get recent reviews:", error);
        next(InternalServerError("Failed to get recent reviews"));
    }
});

router.get("/api/logs/reviews/:movie_id", authenticateToken,async (req, res, next) => {
        const movieId = req.params.movie_id;
        try {
            const result = await pgClient.query(
                `SELECT watch_logs.id, users.username, users.profile_picture, users.id AS user_id, watch_logs.watched_on, watch_logs.rating, watch_logs.review, watch_logs.created_at,
                    (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = watch_logs.id) AS total_likes
             FROM watch_logs 
             INNER JOIN users ON watch_logs.user_id = users.id 
             WHERE watch_logs.movie_id = $1 AND watch_logs.review IS NOT NULL AND watch_logs.review <> ''`,
                [movieId]
            );

            if (result.rows.length === 0) {
                return next(NotFoundError("No reviews found for this movie"));
            } else {
                res.send({ data: result.rows });
            }
        } catch (error) {
            console.error("Failed to get reviews for movie:", error);
            next(InternalServerError("Failed to get reviews for movie"));
        }
    }
);

router.get("/api/logs/user/:user_id", authenticateToken, async (req, res, next) => {
    const userId = req.params.user_id;
    try {
        const result = await pgClient.query(
            `WITH last_four_movies AS (
                SELECT movies.title, movies.poster_path, watch_logs.movie_id, watch_logs.rating, watch_logs.watched_on
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
            SELECT last_four_movies.title, last_four_movies.movie_id, last_four_movies.rating, last_four_movies.watched_on, last_four_movies.poster_path, unique_movies_count.unique_movies_watched
            FROM last_four_movies
            CROSS JOIN unique_movies_count;`,
            [userId]
        );

        if (result.rows.length === 0) {
            return next(NotFoundError("No logs found for this user"));
        } else {
            const movieDetails = result.rows.map(row => ({
                movie_id: row.movie_id,
                title: row.title,
                rating: row.rating,
                watched_on: row.watched_on,
                poster_path: row.poster_path,
            }));

            const formattedResponse = {
                data: {
                    unique_movies_watched: result.rows[0].unique_movies_watched,
                    last_four: movieDetails,
                },
            };

            res.send(formattedResponse);
        }
    } catch (error) {
        console.error("Failed to get logs for user:", error);
        next(InternalServerError("Failed to get logs for user"));
    }
});

router.get("/api/logs/user/:user_id/watched", authenticateToken, async (req, res, next) => {
    const userId = req.params.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const logsQuery = `
            SELECT DISTINCT ON (watch_logs.movie_id) watch_logs.id, movies.title, movies.id AS movie_id, movies.release_date, watch_logs.watched_on, watch_logs.rating, watch_logs.review, watch_logs.created_at, movies.poster_path
            FROM watch_logs
            INNER JOIN movies ON watch_logs.movie_id = movies.id
            WHERE watch_logs.user_id = $1
            ORDER BY watch_logs.movie_id, watch_logs.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const logsResult = await pgClient.query(logsQuery, [
            userId,
            limit,
            offset,
        ]);

        const countQuery = `
            SELECT COUNT(DISTINCT watch_logs.movie_id) AS count
            FROM watch_logs
            WHERE watch_logs.user_id = $1
        `;

        const countResult = await pgClient.query(countQuery, [userId]);
        const totalUniqueMovies = countResult.rows[0].count;
        const totalPages = Math.ceil(totalUniqueMovies / limit);

        if (logsResult.rows.length === 0) {
            return next(NotFoundError("No logs found for this user"));
        } else {
            const logDetails = logsResult.rows.map((row) => ({
                id: row.id,
                movie_id: row.movie_id,
                title: row.title,
                release_date: row.release_date,
                watched_on: row.watched_on,
                rating: row.rating,
                review: row.review,
                created_at: row.created_at,
                poster_path: row.poster_path,
            }));

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
    } catch (error) {
        console.error("Failed to get watched logs for user:", error);
        next(InternalServerError("Failed to get watched logs for user"));
    }
});

router.get("/api/logs/user/:user_id/reviews", authenticateToken, async (req, res, next) => {
    const userId = req.params.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const reviewsQuery = `
            SELECT watch_logs.id, movies.title, movies.id AS movie_id, movies.release_date, watch_logs.watched_on, watch_logs.rating, watch_logs.review, watch_logs.created_at, watch_logs.user_id, movies.poster_path,
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
            return next(NotFoundError("No reviews found for this user"));
        } else {
            const reviewDetails = reviewsResult.rows.map((row) => ({
                id: row.id,
                movie_id: row.movie_id,
                title: row.title,
                release_date: row.release_date,
                watched_on: row.watched_on,
                rating: row.rating,
                review: row.review,
                created_at: row.created_at,
                poster_path: row.poster_path,
                user_id: row.user_id,
                total_likes: row.total_likes,
            }));

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
    } catch (error) {
        console.error("Failed to get reviews for user:", error);
        next(InternalServerError("Failed to get reviews for user"));
    }
});


router.post("/api/logs", authenticateToken, async (req, res, next) => {
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

        const watchlistQuery = await pgClient.query(
            `SELECT * FROM watchlist_movies WHERE movie_id = $1 AND user_id = $2`,
            [movieId, userId]
        );

        if (watchlistQuery.rows.length > 0) {
            await pgClient.query(
                `DELETE FROM watchlist_movies WHERE movie_id = $1 AND user_id = $2`,
                [movieId, userId]
            );
        }

        res.send({ data: log.rows[0] });
    } catch (error) {
        console.error("Database error:", error);
        next(InternalServerError("An error occurred while creating the log."));
    }
});

router.patch("/api/logs/:id", authenticateToken, async (req, res, next) => {
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
            return next(NotFoundError("Log not found"));
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
        next(InternalServerError("An error occurred while updating the log."));
    }
});

router.delete("/api/logs/:id", authenticateToken, async (req, res, next) => {
    const id = req.params.id;

    try {
        const log = await pgClient.query(
            "DELETE FROM watch_logs WHERE id = $1 RETURNING *",
            [id]
        );

        if (log.rows.length === 0) {
            return next(NotFoundError("Log not found"));
        }

        res.send({ data: log.rows[0] });
    } catch (error) {
        console.error("Database error:", error);
        next(InternalServerError("An error occurred while deleting the log."));
    }
});

export default router;
