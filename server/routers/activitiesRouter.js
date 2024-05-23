import { Router } from "express";
import mongoDBConnection from "../database/mongoDBConnection.js";

const router = Router();

router.get("/api/activities/recent", async (req, res) => {
    try {
        const activities = await mongoDBConnection.activities.find().sort({
            createdAt: -1
        }).limit(10).toArray();
        res.json({
            data: activities
        });
    } catch (error) {
        console.error("Error getting recent activities:", error);
        res.status(500).send("Failed to get recent activities");
    }
});


export default router;