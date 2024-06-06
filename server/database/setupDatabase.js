import pgClient from "./pgConnection.js";

const isDeleteMode = process.argv.includes("delete");

(async function () {
    try {
        if (isDeleteMode) {
            await pgClient.query(`DROP TABLE IF EXISTS movie_genres;`);
            await pgClient.query(`DROP TABLE IF EXISTS genres;`);
            await pgClient.query(`DROP TABLE IF EXISTS watch_logs;`);
            await pgClient.query(`DROP TABLE IF EXISTS users;`);
            await pgClient.query(`DROP TABLE IF EXISTS favorite_movies;`);
            await pgClient.query(`DROP TABLE IF EXISTS watchlist_movies;`);
            await pgClient.query(`DROP TABLE IF EXISTS user_follows;`);
            await pgClient.query(`DROP TABLE IF EXISTS review_likes;`);
            await pgClient.query(`DROP TABLE IF EXISTS review_comments;`);
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
            profile_picture TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                status VARCHAR(50),
                popularity FLOAT,
                poster_path TEXT,
                vote_average FLOAT,
                vote_count INT,
                cast_list JSONB,
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

        await pgClient.query(`CREATE TABLE IF NOT EXISTS favorite_movies (
            user_id INT,
            movie_id INT,
            PRIMARY KEY (user_id, movie_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (movie_id) REFERENCES movies(id)
        )`);

        await pgClient.query(`CREATE TABLE IF NOT EXISTS watchlist_movies (
            user_id INT,
            movie_id INT,
            PRIMARY KEY (user_id, movie_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (movie_id) REFERENCES movies(id)
        )`);

        await pgClient.query(`CREATE TABLE IF NOT EXISTS user_follows (
            follower_id INT,
            followed_id INT,
            PRIMARY KEY (follower_id, followed_id),
            FOREIGN KEY (follower_id) REFERENCES users(id),
            FOREIGN KEY (followed_id) REFERENCES users(id)
        )`);

        await pgClient.query(`CREATE TABLE IF NOT EXISTS review_likes (
            user_id INT,
            review_id INT,
            PRIMARY KEY (user_id, review_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (review_id) REFERENCES watch_logs(id)
        )`);

        await pgClient.query(`CREATE TABLE IF NOT EXISTS review_comments (
            id SERIAL PRIMARY KEY,
            review_id INT,
            user_id INT,
            comment_text TEXT,
            comment_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (review_id) REFERENCES watch_logs(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );`);

        await pgClient.query(`CREATE TABLE IF NOT EXISTS user_movie_lists (
            id SERIAL PRIMARY KEY,
            user_id INT,
            list_name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);
        
        await pgClient.query(`CREATE TABLE IF NOT EXISTS movie_list_items (
            id SERIAL PRIMARY KEY,
            list_id INT,
            movie_id INT,
            FOREIGN KEY (list_id) REFERENCES user_movie_lists(id),
            FOREIGN KEY (movie_id) REFERENCES movies(id)
        )`);

        await pgClient.query(`
            ALTER TABLE user_follows DROP CONSTRAINT IF EXISTS user_follows_followed_id_fkey;
            ALTER TABLE user_follows ADD CONSTRAINT user_follows_followed_id_fkey FOREIGN KEY (followed_id) REFERENCES users (id) ON DELETE CASCADE;

            ALTER TABLE user_follows DROP CONSTRAINT IF EXISTS user_follows_follower_id_fkey;
            ALTER TABLE user_follows ADD CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE;
        `);

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
