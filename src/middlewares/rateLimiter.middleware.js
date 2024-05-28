import { rateLimit } from "express-rate-limit";
import {GLOBAL_API_RATELIMITER_REQUEST_COUNT,RESET_PASSWORD_RATELIMITER_REQUEST_COUNT} from "../constants.js"
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: GLOBAL_API_RATELIMITER_REQUEST_COUNT, 
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
const resetPasswordRateLimiter = rateLimit({
	windowMs: 1440 * 60 * 1000, 
	limit: RESET_PASSWORD_RATELIMITER_REQUEST_COUNT , 
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
    keyGenerator: (req, res) => {
        return req.clientIp; 
    },
    handler: (_, __, ___, options) => {
        throw new ApiError(
            options.statusCode || 500,
            `There are too many requests. You are only allowed ${ options.max } requests per ${ options.windowMs / 60000} minutes`
    );
},
})
export {
    limiter,
    resetPasswordRateLimiter
}