import { Router } from "express";
import { ObjectId } from "mongodb";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();

import authenticateToken from "../util/authenticateToken.js";

router.get("/api/activities/recent", authenticateToken, async (req, res) => {
    try {
        const activities = await mongoClient.activities
            .find()
            .sort({
                createdAt: -1,
            })
            .limit(10)
            .toArray();
        res.json({
            data: activities,
        });
    } catch (error) {
        console.error("Error getting recent activities:", error);
        res.status(500).send("Failed to get recent activities");
    }
});

router.get("/api/activities/unread/:user_id", authenticateToken, async (req, res) => {
        const userId = req.params.user_id;

        try {
            const notifications = await mongoClient.activities
                .find({ userId, read: false })
                .toArray();
            res.json({ data: notifications });
        } catch (error) {
            console.error("Error fetching unread notifications:", error);
            res.status(500).send("Failed to fetch unread notifications");
        }
    }
);

router.post("/api/activities/read", authenticateToken, async (req, res) => {
    const { userId, activityId } = req.body;

    try {
        await mongoClient.activities.updateOne(
            { _id: new ObjectId(activityId), userId },
            { $set: { read: true } }
        );
        const updatedNotification = await mongoClient.activities.findOne({ _id: new ObjectId(activityId) });
        res.send({ data: updatedNotification });
    } catch (error) {
        console.error("Error marking activity as read:", error);
        res.status(500).send("Failed to mark activity as read");
    }
});

export default router;
