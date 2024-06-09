import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 4,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

export { limiter, authRateLimiter };
