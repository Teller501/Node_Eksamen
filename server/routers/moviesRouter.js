import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";
import NodeCache from "node-cache";
import { tmdbIds } from "../util/linksCSVParser.js";

const router = Router();
const cache = new NodeCache({ stdTTL: 600 });

async function getAllMovies(
    page = 1,
    limit = 10,
    sortByPopularity = false,
    yearFilter = null,
    genreFilter = null,
    tmdbIdSet = null
) {
    try {
        let query = `
            SELECT movies.id, movies.title, movies.overview, array_agg(genres.name) AS genres
            FROM movies
            INNER JOIN movie_genres ON movies.id = movie_genres.movie_id
            INNER JOIN genres ON movie_genres.genre_id = genres.id
        `;
        let params = [];
        let conditions = [];

        if (yearFilter) {
            const startYear = parseInt(yearFilter);
            const endYear = startYear + 9;
            conditions.push(
                `movies.release_date >= '${startYear}-01-01' AND movies.release_date <= '${endYear}-12-31'`
            );
        }

        if (genreFilter) {
            query += ` WHERE genres.name = $1`;
            params.unshift(genreFilter);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += ` GROUP BY movies.id`;

        const [pgMovies, mongoMovies] = await Promise.all([
            pgClient.query(query, params),
            mongoClient.movies.find({}, { projection: { cast: 0 } }).toArray(),
        ]);

        const pgMoviesData = pgMovies.rows;
        const mongoMap = mongoMovies.reduce((acc, movie) => {
            acc[movie.id.toString()] = movie;
            return acc;
        }, {});

        let mergedMovies = pgMoviesData.map((pgMovie) => {
            const mongoMovie = mongoMap[pgMovie.id.toString()];
            return {
                ...pgMovie,
                popularity: mongoMovie?.popularity ?? 0,
                vote_average: mongoMovie?.voteAverage ?? 0,
                vote_count: mongoMovie?.voteCount ?? 0,
                cast: mongoMovie?.cast ?? [],
                poster_path: mongoMovie?.posterPath ?? "",
            };
        });

        if (sortByPopularity) {
            mergedMovies.sort((a, b) => b.popularity - a.popularity);
        }

        if (tmdbIdSet) {
            mergedMovies = mergedMovies.filter((movie) =>
                tmdbIdSet.has(movie.id.toString())
            );
        }

        const totalMovies = mergedMovies.length;
        const totalPages = Math.ceil(totalMovies / limit);

        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        const offset = (page - 1) * limit;
        const paginatedMovies = mergedMovies.slice(offset, offset + limit);

        const response = {
            data: paginatedMovies,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                has_next_page: hasNextPage,
                has_previous_page: hasPreviousPage,
                next_page: hasNextPage ? page + 1 : null,
                previous_page: hasPreviousPage ? page - 1 : null,
            },
        };

        return response;
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
        const movieResults = await getAllMovies(
            page,
            limit,
            true,
            yearFilter,
            genreFilter
        );

        res.send(movieResults);
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
        const movieResults = await getAllMovies(
            page,
            limit,
            false,
            yearFilter,
            genreFilter
        );

        res.json(movieResults);
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

        const searchResults = await mongoClient.movies
            .find({
                title: { $regex: searchQuery, $options: "i" },
            })
            .toArray();

        const response = searchResults.map((movie) => {
            return {
                id: movie.id,
                title: movie.title,
                poster_path: movie.posterPath,
                vote_average: movie.voteAverage,
                vote_count: movie.voteCount,
                cast: movie.cast,
            };
        });

        res.json({ data: response });
    } catch (error) {
        console.error("Error searching movies:", error);
        res.status(500).send("Failed to search movies");
    }
});

router.get("/api/movies/recommender", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const yearFilter = req.query.year;
        const genreFilter = req.query.genre;
        const tmdbIdSet = new Set(tmdbIds);

        const response = await getAllMovies(
            page,
            limit,
            true,
            yearFilter,
            genreFilter,
            tmdbIdSet
        );

        res.send(response);
    } catch (error) {
        console.error("Error fetching recommender movies:", error);
        res.status(500).send("Failed to fetch recommender movies");
    }
});

router.get("/api/movies/:id", async (req, res) => {
    try {
        const pgMovieResult = await pgClient.query(
            `SELECT * FROM movies WHERE id = $1`,
            [req.params.id]
        );
        const pgMovieData = pgMovieResult.rows[0];

        if (!pgMovieData) {
            return res.status(404).send("Movie not found");
        }

        const mongoMovie = await mongoClient.movies.findOne({
            id: parseInt(req.params.id),
        });

        const mergedMovie = {
            ...pgMovieData,
            popularity: mongoMovie?.popularity ?? 0,
            vote_average: mongoMovie?.voteAverage ?? 0,
            vote_count: mongoMovie?.voteCount ?? 0,
            cast: mongoMovie?.cast ?? [],
            poster_path: mongoMovie?.posterPath ?? "",
        };

        res.json({ data: mergedMovie });
    } catch (error) {
        res.status(500).send("Failed to fetch movie");
    }
});

export default router;
