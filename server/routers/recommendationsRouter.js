import { Router } from "express";
import axios from "axios";
import "dotenv/config";
import mongoClient from "../database/mongoDBConnection.js";

const router = Router();
const recommendationsURL = process.env.RECOMMENDATIONS_URL;

router.get("/api/recommendations/:user_id", async (req, res) => {
    const userId = Number(req.params.user_id);

    try {
        const recommendations = await mongoClient.recommendations.findOne({
            userId: userId,
        });

        if (!recommendations) {
            return res.json({ data: [] });
        }

        res.json({ data: recommendations.recommendations });
    } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

router.post("/api/recommendations", async (req, res) => {
    const body = req.body
    
    const payload = {
        user_id: body.user_id,
        user_ratings: body.user_ratings
    };

    try {
        const response = await axios.post(`${recommendationsURL}/recommend`, payload);

        const recommendations = response.data.recommendations;

        const updateObject = {
            $addToSet: {
                recommendations: {
                    $each: recommendations
                }
            }
        };

        await mongoClient.recommendations.updateOne(
            { userId: body.user_id },
            updateObject,
            { upsert: true }
        );

        res.json({ data: response.data});
    } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

export default router;