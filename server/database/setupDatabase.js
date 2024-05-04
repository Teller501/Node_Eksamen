import db from "./connection.js";

const isDeleteMode = process.argv.includes('delete');

if (isDeleteMode) {
    await db.run(`DROP TABLE IF EXISTS users;`);
}

await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN
)`);

if (isDeleteMode) {
    await db.run(`INSERT INTO users (username, password, email, is_active)
    VALUES
    ('Bent', '1234', 'bent@mail.dk', TRUE),
    ('Lars', '1234', 'lars@mail.dk', FALSE);
    `);
}