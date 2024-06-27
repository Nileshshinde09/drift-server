import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../../redis/index.js';
import { worker } from '../worker/notification.worker.js';//it is imp to just call the worker for exicution.
const notificationQueue = new Queue('send-notification', {
    connection: redisConnection,
});

const sendNotifications = async (userId, message="",payload = "", url = null, type ,reciever=null) => {
    try {
        await notificationQueue.add('send-notification', {
            userId,
            message,
            payload,
            url,
            type,
            reciever
        });
    } catch (error) {
        console.error('Error adding job to queue:', error);
    }
};


export { sendNotifications, notificationQueue };
