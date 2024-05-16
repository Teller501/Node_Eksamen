import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/api/users", async (req, res) => {
    try {
        const query = 'SELECT * FROM users';
        const result = await pgClient.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).send("Failed to get user");
    }
});

router.get("/api/users/:id", async (req, res) => {
    try {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pgClient.query(query, [req.params.id]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error getting user:", error);
        res.status(500).send("Failed to get user");
    }
});

router.patch("/api/users/:id", upload.single("profile_picture"), async (req, res) => {
    try {
        const { full_name, birth_date, location, bio, profile_picture } = req.body;
        const query = 'UPDATE users SET full_name = $1, birth_date = $2, location = $3, bio = $4, profile_picture = $5 WHERE id = $6';
        const result = await pgClient.query(query, [full_name, birth_date, location, bio, profile_picture, req.params.id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Failed to update user");
    }
});

export default router;
