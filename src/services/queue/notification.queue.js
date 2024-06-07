import { Queue } from "bullmq"
import { redisConnection } from "../../redis/index.js"
// --------------------------------Create Queue--------------------------------------------

const notificationQueue = new Queue('send-notification', {
    connection: redisConnection
});

// --------------------------------Add Jobs to queue--------------------------------------------
const sendNotifications = async ({userId,message="",url=null,type}) => {
    await notificationQueue.add('send-notification', {
        userId,
        message,
        url,
        type
    });
}

export {
    sendNotifications
}