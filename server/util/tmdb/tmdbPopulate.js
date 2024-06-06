import axios from "axios";
import pgClient from "../../database/pgConnection.js";
import mongoClient from "../../database/mongoDBConnection.js";
import Bottleneck from "bottleneck";

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

const limiter = new Bottleneck({
    minTime: 20 // Ensures we don't exceed 50 requests per second
});

let currentPage = 1;
let maxDate = new Date("2024-05-01").toISOString().split('T')[0];
let minDate = getMinDate(maxDate, 1);
let maxYear = 1950;

const fetchTMDBData = limiter.wrap(async function () {
    try {
        const response = await axios.get(
            `${BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=${currentPage}&sort_by=popularity.desc&api_key=${API_KEY}&primary_release_date.gte=${minDate}&primary_release_date.lte=${maxDate}`
        );

        const totalPages = response.data.total_pages;

        if (currentPage >= totalPages) {
            currentPage = 1;
            maxDate = minDate;
            minDate = getMinDate(maxDate, 1);

            if (new Date(minDate).getFullYear() < maxYear) {
                minDate = `${maxYear}-01-01`;
            }
        } else {
            currentPage++;
        }

        const movies = response.data.results;

        const moviePromises = movies.map(async (movie) => {
            try {
                const detailedMovieResponse = await axios.get(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`);
                const castResponse = await axios.get(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`);
                await insertMovieToMySQL(detailedMovieResponse.data);
                await insertMovieToMongoDB(detailedMovieResponse.data, castResponse.data.cast);
            } catch (error) {
                console.error(`Failed to fetch details for movie ID: ${movie.id}`, error);
            }
        });

        await Promise.all(moviePromises);

    } catch (error) {
        console.error("Failed to fetch or store movies:", error);
    }
});

function getMinDate(maxDate, monthsToSubtract) {
    const maxDateObj = new Date(maxDate);
    maxDateObj.setMonth(maxDateObj.getMonth() - monthsToSubtract);
    return maxDateObj.toISOString().split('T')[0];
}

async function insertMovieToMySQL(movieData) {
    try {
        const genres = movieData.genres;
        const movie = movieData;

        await pgClient.query(
            `INSERT INTO movies (id, title, original_title, overview, backdrop_path, release_date, original_language, runtime, budget, revenue, status, popularity)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            original_title = EXCLUDED.original_title,
            overview = EXCLUDED.overview,
            backdrop_path = EXCLUDED.backdrop_path,
            release_date = EXCLUDED.release_date,
            original_language = EXCLUDED.original_language,
            runtime = EXCLUDED.runtime,
            budget = EXCLUDED.budget,
            revenue = EXCLUDED.revenue,
            status = EXCLUDED.status`,
            [
                movie.id,
                movie.title,
                movie.original_title,
                movie.overview,
                movie.backdrop_path,
                movie.release_date,
                movie.original_language,
                movie.runtime,
                movie.budget,
                movie.revenue,
                movie.status,
                movie.popularity
            ]
        );

        for (const genre of genres) {
            await pgClient.query(
                `INSERT INTO genres (id, name)
                VALUES ($1, $2)
                ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name`,
                [genre.id, genre.name]
            );

            await pgClient.query(
                `INSERT INTO movie_genres (movie_id, genre_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING`,
                [movie.id, genre.id]
            );
        }
    } catch (error) {
        console.error("Failed to insert or update movie in database:", error);
    }
}

async function insertMovieToMongoDB(movieData, cast) {
    try {
        const filter = { id: movieData.id }; 
        const update = {
            $set: {
                title: movieData.title,
                cast: cast,
                voteAverage: movieData.vote_average,
                voteCount: movieData.vote_count,
                posterPath: movieData.poster_path,
            },
        };
        const options = { upsert: true };

        await mongoClient.movies.updateOne(filter, update, options);
    } catch (error) {
        console.error("Failed to upsert movie in MongoDB:", error);
    }
}

export { fetchTMDBData };
