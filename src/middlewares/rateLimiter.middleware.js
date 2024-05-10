import { rateLimit } from "express-rate-limit";
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5000, 
    standardHeaders: true, 
    legacyHeaders: false, 
    keyGenerator: (req, res) => {
        return req.clientIp; 
    },
    handler: (_, __, ___, options) => {
        throw new ApiError(
            options.statusCode || 500,
            `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
},
});

export {
    limiter
}