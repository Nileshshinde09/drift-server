import IORedis from "ioredis";
import { REDIS_HOST,REDIS_PORT } from "../constants.js";
export const redisConnection = new IORedis({
  host: REDIS_HOST, 
  port: REDIS_PORT,        
});


