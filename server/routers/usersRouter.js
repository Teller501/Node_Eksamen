import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

const checkFileType = function (file, cb) {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb("Error: You can only upload images!!");
    }
};

const storage = multer.diskStorage({
    destination: "./images",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}--${file.originalname}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
});

router.get("/api/users", async (req, res) => {
    try {
        const query = "SELECT * FROM users";
        const result = await pgClient.query(query);

        const users = result.rows;

        res.json({ data: users });
    } catch (error) {
        console.error("Error getting users:", error);
        res.status(500).send("Failed to get users");
    }
});

router.get("/api/users/search", async (req, res) => {
    const q = req.query.q;
    if (!q) {
        return res.status(400).send("Missing query parameter 'q'");
    }

    try {
        const query = "SELECT username, profile_picture FROM users WHERE username ILIKE $1";
        const result = await pgClient.query(query, [`%${q}%`]);
        const users = result.rows;

        res.json({ data: users });
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).send("Failed to search users");
    }
});

router.get("/api/users/:id([0-9]+)", async (req, res) => {
    try {
        const query = "SELECT * FROM users WHERE id = $1";
        const result = await pgClient.query(query, [req.params.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        res.json({ data: user });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).send({ error: "Failed to get user" });
    }
});

router.get("/api/users/:username([a-zA-Z0-9_]+)", async (req, res) => {
    try {
        const username = req.params.username;

        const query = `
            SELECT 
                u.*, 
                (SELECT COUNT(*) FROM user_follows WHERE followed_id = u.id) AS followers_count,
                (SELECT COUNT(*) FROM user_follows WHERE follower_id = u.id) AS following_count
            FROM users u 
            WHERE u.username = $1
        `;
        
        const result = await pgClient.query(query, [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        res.json({ data: user });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).send({ error: "Failed to get user" });
    }
});

router.patch(
    "/api/users/:id",
    upload.single("profile_picture"),
    async (req, res) => {
        try {
            const { full_name, birth_date, location, bio } = req.body;

            const existingUser = await pgClient.query(
                "SELECT profile_picture FROM users WHERE id = $1",
                [req.params.id]
            );
            const existingProfilePicturePath =
                existingUser.rows[0]?.profile_picture || null;

            const profile_picture_path = req.file
                ? req.file.path
                : existingProfilePicturePath;

            const updateQuery =
                "UPDATE users SET full_name = $1, birth_date = $2, location = $3, bio = $4, profile_picture = $5 WHERE id = $6";
            await pgClient.query(updateQuery, [
                full_name,
                birth_date,
                location,
                bio,
                profile_picture_path,
                req.params.id,
            ]);

            const selectQuery = "SELECT * FROM users WHERE id = $1";
            const result = await pgClient.query(selectQuery, [req.params.id]);

            if (result.rows.length === 0) {
                return res.status(404).send("User not found");
            }

            res.json({ data: result.rows[0] });
        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).send("Failed to update user");
        }
    }
);

export default router;
