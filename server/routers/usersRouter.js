import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import multer from "multer";
import path from "path";
import {
    NotFoundError,
    BadRequestError,
    InternalServerError,
} from "../util/errors.js";

const router = Router();

const checkFileType = function (file, cb) {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb("Error: You can only upload images!!");
    }
};

const storage = multer.diskStorage({
    destination: "./images",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}--${file.originalname}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
});

import authenticateToken from "../util/authenticateToken.js";

router.get("/api/users", authenticateToken, async (req, res, next) => {
    try {
        const query = "SELECT * FROM users";
        const result = await pgClient.query(query);

        const users = result.rows;

        res.json({ data: users });
    } catch (error) {
        console.error("Error getting users:", error);
        next(InternalServerError("Failed to get users"));
    }
});

router.get("/api/users/search", authenticateToken, async (req, res, next) => {
    const q = req.query.q;
    if (!q) {
        return next(BadRequestError("Query parameter 'q' is required"));
    }

    try {
        const query =
            "SELECT username, profile_picture FROM users WHERE username ILIKE $1";
        const result = await pgClient.query(query, [`%${q}%`]);
        const users = result.rows;

        res.json({ data: users });
    } catch (error) {
        console.error("Error searching users:", error);
        next(InternalServerError("Failed to search users"));
    }
});

router.get(
    "/api/users/:id([0-9]+)",
    authenticateToken,
    async (req, res, next) => {
        try {
            const query = "SELECT * FROM users WHERE id = $1";
            const result = await pgClient.query(query, [req.params.id]);
            const user = result.rows[0];

            if (!user) {
                return next(NotFoundError("User not found"));
            }

            res.json({ data: user });
        } catch (error) {
            console.error("Error getting user:", error);
            next(InternalServerError("Failed to get user"));
        }
    }
);

router.get(
    "/api/users/:username([a-zA-Z0-9_]+)",
    authenticateToken,
    async (req, res, next) => {
        const username = req.params.username;
        try {

            const query = `
            SELECT 
                u.*, 
                (SELECT COUNT(*) FROM user_follows WHERE followed_id = u.id) AS followers_count,
                (SELECT COUNT(*) FROM user_follows WHERE follower_id = u.id) AS following_count
            FROM users u 
            WHERE u.username = $1
        `;

            const result = await pgClient.query(query, [username]);
            const user = result.rows[0];

            if (!user) {
                return next(NotFoundError("User not found"));
            }

            res.json({ data: user });
        } catch (error) {
            console.error("Error getting user:", error);
            next(InternalServerError("Failed to get user"));
        }
    }
);

router.get(
    "/api/users/:userId/statistics",
    authenticateToken,
    async (req, res, next) => {
        const userId = req.params.userId;
        try {
            const totalMoviesWatchedRes = await pgClient.query(
                "SELECT COUNT(DISTINCT movie_id) FROM watch_logs WHERE user_id = $1",
                [userId]
            );
            const totalMoviesWatched =
                totalMoviesWatchedRes.rows[0]?.count || 0;

            const currentYear = new Date().getFullYear();
            const moviesWatchedThisYearRes = await pgClient.query(
                "SELECT COUNT(DISTINCT movie_id) FROM watch_logs WHERE user_id = $1 AND EXTRACT(YEAR FROM watched_on) = $2",
                [userId, currentYear]
            );
            const moviesWatchedThisYear =
                moviesWatchedThisYearRes.rows[0]?.count || 0;

            const mostMoviesInAMonthRes = await pgClient.query(
                `
            SELECT EXTRACT(MONTH FROM watched_on) AS month, EXTRACT(YEAR FROM watched_on) AS year, COUNT(*)
            FROM watch_logs
            WHERE user_id = $1
            GROUP BY month, year
            ORDER BY COUNT DESC
            LIMIT 1`,
                [userId]
            );
            const mostMoviesInAMonth = mostMoviesInAMonthRes.rows[0] || {
                count: 0,
                month: "N/A",
                year: "N/A",
            };

            const mostMoviesInADayRes = await pgClient.query(
                `
            SELECT watched_on, COUNT(*)
            FROM watch_logs
            WHERE user_id = $1
            GROUP BY watched_on
            ORDER BY COUNT DESC
            LIMIT 1`,
                [userId]
            );
            const mostMoviesInADay = mostMoviesInADayRes.rows[0] || {
                count: 0,
                watched_on: "N/A",
            };

            const averageRatingRes = await pgClient.query(
                `
            SELECT AVG(rating) AS average_rating
            FROM watch_logs
            WHERE user_id = $1 AND rating IS NOT NULL`,
                [userId]
            );
            const averageRating =
                averageRatingRes.rows[0]?.average_rating || null;

            const mostWatchedGenreRes = await pgClient.query(
                `
            SELECT genres.name, COUNT(*) AS count
            FROM watch_logs
            JOIN movies ON watch_logs.movie_id = movies.id
            JOIN movie_genres ON movies.id = movie_genres.movie_id
            JOIN genres ON movie_genres.genre_id = genres.id
            WHERE watch_logs.user_id = $1
            GROUP BY genres.name
            ORDER BY COUNT DESC
            LIMIT 1`,
                [userId]
            );
            const mostWatchedGenre = mostWatchedGenreRes.rows[0] || {
                name: "N/A",
            };

            const response = {
                total_movies_watched: totalMoviesWatched,
                movies_watched_this_year: moviesWatchedThisYear,
                most_movies_in_a_month: mostMoviesInAMonth.count
                    ? `${mostMoviesInAMonth.count} (${mostMoviesInAMonth.month}/${mostMoviesInAMonth.year})`
                    : "N/A",
                most_movies_in_a_day: mostMoviesInADay.count
                    ? `${mostMoviesInADay.count} (${
                          mostMoviesInADay.watched_on
                              .toISOString()
                              .split("T")[0]
                      })`
                    : "N/A",
                average_rating: averageRating
                    ? parseFloat(averageRating).toFixed(2)
                    : "N/A",
                most_watched_genre: mostWatchedGenre.name,
            };

            res.json({ data: response });
        } catch (error) {
            console.error("Error fetching user statistics:", error);
            next(InternalServerError("Failed to fetch user statistics"));
        }
    }
);

router.patch(
    "/api/users/:id",
    upload.single("profile_picture"),
    authenticateToken,
    async (req, res, next) => {
        const { full_name, birth_date, location, bio } = req.body;
        
        try {
            const existingUser = await pgClient.query(
                "SELECT profile_picture FROM users WHERE id = $1",
                [req.params.id]
            );
            const existingProfilePicturePath =
                existingUser.rows[0]?.profile_picture || null;

            const profile_picture_path = req.file
                ? req.file.path
                : existingProfilePicturePath;

            const updateQuery =
                "UPDATE users SET full_name = $1, birth_date = $2, location = $3, bio = $4, profile_picture = $5 WHERE id = $6";
            await pgClient.query(updateQuery, [
                full_name,
                birth_date,
                location,
                bio,
                profile_picture_path,
                req.params.id,
            ]);

            const selectQuery = "SELECT * FROM users WHERE id = $1";
            const result = await pgClient.query(selectQuery, [req.params.id]);

            if (result.rows.length === 0) {
                return next(NotFoundError("User not found"));
            }

            res.json({ data: result.rows[0] });
        } catch (error) {
            console.error("Error updating user:", error);
            next(InternalServerError("Failed to update user"));
        }
    }
);

router.delete("/api/users/:id", authenticateToken, async (req, res, next) => {
    try {
        const query = "DELETE FROM users WHERE id = $1";
        await pgClient.query(query, [req.params.id]);

        res.send("User deleted successfully");
    } catch (error) {
        console.error("Error deleting user:", error);
        next(InternalServerError("Failed to delete user"));
    }
});

export default router;
