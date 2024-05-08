import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

async function getAllMovies(page = 1, limit = 10, sortByPopularity = false) {
    try {
        const pgMovies = await pgClient.query("SELECT * FROM movies");
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
        const movieResults = await getAllMovies(page, limit, true);

        const totalMovies = await pgClient.query("SELECT COUNT(*) FROM movies");
        const totalPages = Math.ceil(totalMovies.rows[0].count / limit);

        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        const response = {
            data: movieResults,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPreviousPage: hasPreviousPage,
                nextPage: hasNextPage ? page + 1 : null,
                previousPage: hasPreviousPage ? page - 1 : null,
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
        const movieResults = await getAllMovies(page, limit);

        const totalMovies = await pgClient.query("SELECT COUNT(*) FROM movies");
        const totalPages = Math.ceil(totalMovies.rows[0].count / limit);

        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        const response = {
            data: movieResults,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPreviousPage: hasPreviousPage,
                nextPage: hasNextPage ? page + 1 : null,
                previousPage: hasPreviousPage ? page - 1 : null,
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
