import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";
import { tmdbIds } from "../util/linksCSVParser.js";
import { NotFoundError, BadRequestError, InternalServerError, } from "../util/errors.js";

const router = Router();

import authenticateToken from "../util/authenticateToken.js";

import { getAllMovies } from "../helper/movieHelper.js";
router.get("/api/movies/popular", authenticateToken, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const yearFilter = req.query.year;
        const genreFilter = req.query.genre;
        const movieResults = await getAllMovies(
            page,
            limit,
            true,
            yearFilter,
            genreFilter
        );

        if (movieResults.data.length === 0) {
            return next(NotFoundError("No movies found"));
        }

        res.send(movieResults);
    } catch (error) {
        console.error("Error fetching popular movies:", error);
        next(InternalServerError("Failed to fetch popular movies"));
    }
});

router.get("/api/movies", authenticateToken, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const yearFilter = req.query.year;
        const genreFilter = req.query.genre;
        const movieResults = await getAllMovies(
            page,
            limit,
            false,
            yearFilter,
            genreFilter
        );

        if (movieResults.data.length === 0) {
            return next(NotFoundError("No movies found"));
        }

        res.json(movieResults);
    } catch (error) {
        console.error("Failed to fetch or merge movies:", error);
        next(InternalServerError("Failed to fetch movies"));
    }
});

router.get("/api/movies/search", authenticateToken, async (req, res, next) => {
    try {
        const searchQuery = req.query.q;

        if (!searchQuery) {
            return next(BadRequestError("Missing query parameter 'q'"));
        }

        const searchResults = await pgClient.query(`
            SELECT id, title, original_title, poster_path, vote_average, vote_count, popularity
            FROM movies
            WHERE title ILIKE $1 OR original_title ILIKE $1
            ORDER BY popularity DESC
            LIMIT 50
        `, [`%${searchQuery}%`]);

        const response = searchResults.rows.map((movie) => ({
            id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            popularity: movie.popularity,
        }));

        res.json({ data: response });
    } catch (error) {
        console.error("Error searching movies:", error);
        next(InternalServerError("Failed to search movies"));
    }
});

router.get("/api/movies/recommender", authenticateToken, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const yearFilter = req.query.year;
        const genreFilter = req.query.genre;
        const tmdbIdSet = new Set(tmdbIds);

        let response = await getAllMovies(
            page,
            limit,
            false,
            yearFilter,
            genreFilter,
            tmdbIdSet
        );

        const shuffledMovies = response.data.sort(() => 0.5 - Math.random());

        response.data = shuffledMovies;

        res.send(response);
    } catch (error) {
        console.error("Error fetching recommender movies:", error);
        next(InternalServerError("Failed to fetch recommender movies"));
    }
});

router.get("/api/movies/:id", authenticateToken, async (req, res, next) => {
    try {
        const pgMovieResult = await pgClient.query(
            `SELECT movies.*, array_agg(genres.name) as genres
            FROM movies
            LEFT JOIN movie_genres ON movies.id = movie_genres.movie_id
            LEFT JOIN genres ON movie_genres.genre_id = genres.id
            WHERE movies.id = $1
            GROUP BY movies.id`,
            [req.params.id]
        );
        const pgMovieData = pgMovieResult.rows[0];

        if (!pgMovieData) {
            return next(NotFoundError("Movie not found"));
        }

        res.json({ data: pgMovieData });
    } catch (error) {
        console.error("Failed to fetch movie:", error);
        next(InternalServerError("Failed to fetch movie"));
    }
});

router.get("/api/movies/:id/similar", authenticateToken, async (req, res, next) => {
    try {
        const pgMovieResult = await pgClient.query(
            `SELECT array_agg(genres.name) as genres
            FROM movies
            LEFT JOIN movie_genres ON movies.id = movie_genres.movie_id
            LEFT JOIN genres ON movie_genres.genre_id = genres.id
            WHERE movies.id = $1
            GROUP BY movies.id`,
            [req.params.id]
        );
        const genres = pgMovieResult.rows[0]?.genres;

        if (!genres) {
            return next(NotFoundError("Genres not found for movie"));
        }

        const similarMoviesResult = await pgClient.query(
            `SELECT movies.id, movies.title, movies.overview, movies.release_date, movies.poster_path, array_agg(genres.name) as genres
            FROM movies
            LEFT JOIN movie_genres ON movies.id = movie_genres.movie_id
            LEFT JOIN genres ON movie_genres.genre_id = genres.id
            WHERE movies.id != $2
            AND movies.release_date > '1980-01-01'
            GROUP BY movies.id
            HAVING array_agg(genres.name) @> $1::text[]
            AND array_agg(genres.name) <@ $1::text[]`,
            [genres, req.params.id]
        );
        const similarMovies = similarMoviesResult.rows;

        let filteredSimilarMovies = similarMovies.filter(
            (movie) => movie.poster_path
        );

        let shuffledSimilarMovies = filteredSimilarMovies
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);

        res.json({ data: shuffledSimilarMovies });
    } catch (error) {
        console.error("Failed to fetch similar movies:", error);
        next(InternalServerError("Failed to fetch similar movies"));
    }
});

export default router;
