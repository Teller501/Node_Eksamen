import { Router } from "express";
import axios from "axios";
import "dotenv/config";
import mongoClient from "../database/mongoDBConnection.js";
import { NotFoundError, BadRequestError, InternalServerError, } from "../util/errors.js";

const router = Router();
const recommendationsURL = process.env.RECOMMENDATIONS_URL;

import authenticateToken from "../util/authenticateToken.js";

router.get("/api/recommendations/:user_id", authenticateToken, async (req, res, next) => {
    const userId = Number(req.params.user_id);

    try {
        const recommendations = await mongoClient.recommendations.findOne({
            userId: userId,
        });

        if (!recommendations) {
            return next(NotFoundError("No recommendations found"));
        }

        res.json({ data: recommendations.recommendations });
    } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        return next(InternalServerError("Failed to fetch recommendations"));
    }
});

router.post("/api/recommendations", authenticateToken, async (req, res, next) => {
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
        return next(InternalServerError("Failed to fetch recommendations"));
    }
});

export default router;