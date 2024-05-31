import { Router } from "express";
import pgClient from "../database/pgConnection.js";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

import authenticateToken from "../util/authenticateToken.js";

router.get("/api/follows/:user_id/following", authenticateToken, async (req, res) => {
    const userId = req.params.user_id;

    try {
        const query = `
            SELECT u.id, u.username, u.profile_picture, u.location
            FROM users u
            JOIN user_follows uf ON u.id = uf.followed_id
            WHERE uf.follower_id = $1
        `;
        const result = await pgClient.query(query, [userId]);

        const users = result.rows;

        res.json({ data: users });
    } catch (error) {
        console.error("Error getting followed users:", error);
        res.status(500).send("Failed to get followed users");
    }
});

router.get("/api/follows/:user_id/followers", authenticateToken, async (req, res) => {
    const userId = req.params.user_id;

    try {
        const query = `
            SELECT u.id, u.username, u.profile_picture, u.location
            FROM users u
            JOIN user_follows uf ON u.id = uf.follower_id
            WHERE uf.followed_id = $1
        `;
        const result = await pgClient.query(query, [userId]);

        const users = result.rows;

        res.json({ data: users });
    } catch (error) {
        console.error("Error getting followers:", error);
        res.status(500).send("Failed to get followers");
    }
});

router.get("/api/follows/:follower_id/:followed_id", authenticateToken, async (req, res) => {
    const followerId = req.params.follower_id;
    const followedId = req.params.followed_id;

    try {
        const query = "SELECT * FROM user_follows WHERE follower_id = $1 AND followed_id = $2";
        const result = await pgClient.query(query, [followerId, followedId]);

        if (result.rows.length > 0) {
            res.json({ data: true });
        } else {
            res.json({ data: false });
        }
    } catch (error) {
        console.error("Error checking follow status:", error);
        res.status(500).send("Failed to check follow status");
    }
});

router.post("/api/follows", authenticateToken, async (req, res) => {
    const { followerId, followedId } = req.body;

    if (!followerId || !followedId) {
        return res.status(400).send("Missing required fields");
    }

    try {
        const query = "INSERT INTO user_follows (follower_id, followed_id) VALUES ($1, $2)";
        await pgClient.query(query, [followerId, followedId]);

        const followerQuery = await pgClient.query("SELECT username, profile_picture FROM users WHERE id = $1", [followerId]);
        const follower = followerQuery.rows[0];

        await mongoClient.activities.insertOne({
            userId: followedId,
            follower: {
                id: followerId,
                username: follower.username,
                profile_picture: follower.profile_picture,
            },
            activityType: "follow",
            date: new Date().toISOString(),
            read: false,
        });

        res.send({ data: "Followed successfully" });
    } catch (error) {
        console.error("Error following user:", error);
        res.status(500).send({ data: "Failed to follow user" });
    }
});

router.delete("/api/follows/:follower_id/:followed_id", authenticateToken, async (req, res) => {
    const followerId = req.params.follower_id;
    const followedId = req.params.followed_id;

    if (!followerId || !followedId) {
        return res.status(400).send("Missing required fields");
    }

    try {
        const query = "DELETE FROM user_follows WHERE follower_id = $1 AND followed_id = $2";
        await pgClient.query(query, [followerId, followedId]);

        await mongoClient.activities.deleteOne({
            userId: followedId,
            "follower.id": followerId,
            activityType: "follow",
        });

        res.send({ data: "Unfollowed successfully" });
    } catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).send({ data: "Failed to unfollow user" });
    }
});

export default router;