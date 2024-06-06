import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

export async function getAllMovies(
    page = 1,
    limit = 10,
    sortByPopularity = false,
    yearFilter = null,
    genreFilter = null,
    tmdbIdSet = null
) {
    try {
        let query = `
            SELECT movies.id, movies.title, movies.popularity, movies.overview, array_agg(genres.name) AS genres
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
            conditions.push(`genres.name = $${conditions.length + 1}`);
            params.push(genreFilter);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += ` GROUP BY movies.id`;

        if (sortByPopularity) {
            query += ` ORDER BY movies.popularity DESC`;
        }

        const offset = (page - 1) * limit;
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const pgMovies = await pgClient.query(query, params);

        const pgMoviesData = pgMovies.rows;
        const movieIds = pgMoviesData.map(movie => Number(movie.id));

        const mongoMovies = await mongoClient.movies.find(
            { id: { $in: movieIds } },
            { projection: { id: 1, posterPath: 1 } }
        ).toArray();

        const mongoMap = mongoMovies.reduce((acc, movie) => {
            acc[movie.id] = movie;
            return acc;
        }, {});

        let mergedMovies = pgMoviesData.map((pgMovie) => {
            const mongoMovie = mongoMap[pgMovie.id];
            return {
                ...pgMovie,
                poster_path: mongoMovie?.posterPath ?? "",
            };
        });

        if (tmdbIdSet) {
            mergedMovies = mergedMovies.filter((movie) =>
                tmdbIdSet.has(movie.id)
            );
        }

        const totalMovies = await pgClient.query(`
            SELECT COUNT(DISTINCT movies.id) AS count
            FROM movies
            INNER JOIN movie_genres ON movies.id = movie_genres.movie_id
            INNER JOIN genres ON movie_genres.genre_id = genres.id
            ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ''}
        `, params.slice(0, params.length - 2));

        const totalPages = Math.ceil(totalMovies.rows[0].count / limit);

        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            data: mergedMovies,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                has_next_page: hasNextPage,
                has_previous_page: hasPreviousPage,
                next_page: hasNextPage ? page + 1 : null,
                previous_page: hasPreviousPage ? page - 1 : null,
            },
        };
    } catch (error) {
        console.error("Error fetching movies:", error);
        throw error;
    }
}
