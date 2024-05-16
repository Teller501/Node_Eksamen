import pgClient from "./pgConnection.js";
import mongoClient from "./mongoDBConnection.js";

const isDeleteMode = process.argv.includes("delete");

(async function () {
    try {
        if (isDeleteMode) {
            await pgClient.query(`DROP TABLE IF EXISTS movie_genres;`);
            await pgClient.query(`DROP TABLE IF EXISTS genres;`);
            await pgClient.query(`DROP TABLE IF EXISTS watch_logs;`);
            await pgClient.query(`DROP TABLE IF EXISTS movies;`);
            await pgClient.query(`DROP TABLE IF EXISTS users;`);
            await mongoClient.movies.deleteMany({});
        }

        await pgClient.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            is_active BOOLEAN,
            full_name TEXT,
            birth_date DATE,
            location TEXT,
            bio TEXT,
            profile_picture BYTEA
        )`);

        await pgClient.query(`
            CREATE TABLE IF NOT EXISTS movies (
                id INT PRIMARY KEY,
                title VARCHAR(255),
                original_title VARCHAR(255),
                overview TEXT,
                backdrop_path VARCHAR(255),
                release_date DATE,
                original_language VARCHAR(10),
                runtime INT,
                budget BIGINT,
                revenue BIGINT,
                status VARCHAR(50)
            );
        `);

        await pgClient.query(`
            CREATE TABLE IF NOT EXISTS genres (
                id INT PRIMARY KEY,
                name VARCHAR(50) UNIQUE
            );
        `);

        await pgClient.query(`
            CREATE TABLE IF NOT EXISTS movie_genres (
                movie_id INT,
                genre_id INT,
                PRIMARY KEY (movie_id, genre_id),
                FOREIGN KEY (movie_id) REFERENCES movies(id),
                FOREIGN KEY (genre_id) REFERENCES genres(id)
            );
        `);

        await pgClient.query(`CREATE TABLE IF NOT EXISTS watch_logs (
            id SERIAL PRIMARY KEY,
            movie_id INT,
            user_id INT,
            watched_on DATE NOT NULL DEFAULT CURRENT_DATE,
            rating DECIMAL(2, 1),
            review TEXT,
            FOREIGN KEY (movie_id) REFERENCES movies(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        if (isDeleteMode) {
            await pgClient.query(`INSERT INTO users (username, password, email, is_active)
            VALUES
            ('Bent', '1234', 'bent@mail.dk', TRUE),
            ('Lars', '1234', 'lars@mail.dk', FALSE);`);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await pgClient.end();
    }
})();
