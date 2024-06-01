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

        return {
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
    } catch (error) {
        console.error("Error fetching movies:", error);
        throw error;
    }
}
