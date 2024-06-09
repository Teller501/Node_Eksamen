import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "./errors.js";

export default function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return next (UnauthorizedError("No token provided"));

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return next(ForbiddenError("Invalid token"));
        req.user = user;
        next();
    });
}
