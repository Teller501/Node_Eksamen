import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

async function getAllMovies(page = 1, limit = 10, sortByPopularity = false, yearFilter = null, genreFilter = null) {
    try {
        let query = `
            SELECT movies.*, array_agg(genres.name) AS genres
            FROM movies
            LEFT JOIN movie_genres ON movies.id = movie_genres.movie_id
            LEFT JOIN genres ON movie_genres.genre_id = genres.id
        `;
        let params = [];
        let conditions = [];

        if (yearFilter) {
            const startYear = parseInt(yearFilter);
            const endYear = startYear + 9;
            conditions.push(`movies.release_date >= '${startYear}-01-01' AND movies.release_date <= '${endYear}-12-31'`);
        }

        if (genreFilter) {
            conditions.push(`genres.name = $1`);
            params.push(genreFilter);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` GROUP BY movies.id`;

        const pgMovies = await pgClient.query(query, params);
        const pgMoviesData = pgMovies.rows;

        const mongoMovies = await mongoClient.movies.find().toArray();

        const mongoMap = mongoMovies.reduce((acc, movie) => {
            acc[movie.id] = movie;
            return acc;
        }, {});

        let mergedMovies = pgMoviesData.map((pgMovie) => {
            const mongoMovie = mongoMap[pgMovie.id];
            if (!mongoMovie) {
                console.log(
                    `No MongoDB match for PostgreSQL movie ID: ${pgMovie.id}`
                );
            }
            return {
                ...pgMovie,
                popularity: mongoMovie.popularity ?? 0,
                vote_average: mongoMovie.voteAverage ?? 0,
                vote_count: mongoMovie.voteCount ?? 0,
                cast: mongoMovie.cast ?? [],
                poster_path: mongoMovie.posterPath ?? "",
            };
        });

        if (sortByPopularity) {
            mergedMovies.sort((a, b) => b.popularity - a.popularity);
        }

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedMovies = mergedMovies.slice(startIndex, endIndex);

        return paginatedMovies;
    } catch (error) {
        return error;
    }
}

router.get("/api/movies/popular", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const yearFilter = req.query.year;
        const genreFilter = req.query.genre;
        const movieResults = await getAllMovies(page, limit, true, yearFilter, genreFilter);

        const totalMovies = await pgClient.query("SELECT COUNT(*) FROM movies");
        const totalPages = Math.ceil(totalMovies.rows[0].count / limit);

        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        const response = {
            data: movieResults,
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
    } catch (error) {
        console.error("Error fetching popular movies:", error);
        res.status(500).send("Failed to fetch popular movies");
    }
});



router.get("/api/movies", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const yearFilter = req.query.year;
        const genreFilter = req.query.genre;
        const movieResults = await getAllMovies(page, limit, false, yearFilter, genreFilter);

        const totalMovies = await pgClient.query("SELECT COUNT(*) FROM movies");
        const totalPages = Math.ceil(totalMovies.rows[0].count / limit);

        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        const response = {
            data: movieResults,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                has_next_page: hasNextPage,
                has_previous_page: hasPreviousPage,
                next_page: hasNextPage ? page + 1 : null,
                previous_page: hasPreviousPage ? page - 1 : null,
            },
        };

        res.json(response);
    } catch (error) {
        console.error("Failed to fetch or merge movies:", error);
        res.status(500).send("Failed to fetch movies");
    }
});

router.get("/api/movies/search", async (req, res) => {
    try {
        const searchQuery = req.query.q;

        if (!searchQuery) {
            return res.status(400).send("Search query is required");
        }

        const searchResults = await mongoClient.movies.find({
            title: { $regex: searchQuery, $options: 'i' } 
        }).toArray();

        res.json({ data: searchResults });
    } catch (error) {
        console.error("Error searching movies:", error);
        res.status(500).send("Failed to search movies");
    }
});

router.get("/api/movies/:id", async (req, res) => {
    try {
        const pgMovieResult = await pgClient.query(
            `SELECT * FROM movies WHERE id = $1`,
            [req.params.id]
        );
        const pgMovieData = pgMovieResult.rows[0];

        const mongoMovie = await mongoClient.movies.findOne({
            id: parseInt(req.params.id),
        });

        if (!pgMovieData) {
            return res.status(404).send("Movie not found");
        }

        if (!mongoMovie) {
            return res.status(404).send("Movie not found");
        }

        const mergedMovie = {
            ...pgMovieData,
            ...mongoMovie,
        };

        res.json({ data: mergedMovie });
    } catch (error) {
        res.status(500).send("Failed to fetch movie");
    }
});


export default router;
