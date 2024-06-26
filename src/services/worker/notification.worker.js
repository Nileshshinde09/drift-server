import { Worker } from 'bullmq';
import { redisConnection } from '../../redis/index.js';
import { NotificationTypesEnum } from '../../constants.js';
import { getFollowers } from '../../utils/notifications/followers.js';
import { getFriends } from '../../utils/notifications/friends.js';
import { io } from '../../app.js';
import { emitSocketEvent } from '../../socket/index.js';
const worker = new Worker('send-notification', async (job) => {
    console.log("Worker started processing job");
    try {
        console.log('Processing job:', job.id);

        const { userId, message = "", payload = {}, url = null, type, reciever } = job.data;
        
        switch (type) {
            case NotificationTypesEnum.FOLLOWERS:
                console.log("Processing followers notification");
                emitSocketEvent(io, '6637dacd70735376e2f90c3c', 'notification', { userId, payload, message, url, type })
       
                // const followersList = await getFollowers(userId);
                
                // if (followersList.length > 0) {
                //     followersList.forEach(follower => {
                //         // 6637dacd70735376e2f90c3c
                //         // follower.followeeId.toString()
                //         emitSocketEvent(io, '6637dacd70735376e2f90c3c', 'notification', { userId, payload, message, url, type })
                        
                //     });
                // }
                break;

            case NotificationTypesEnum.FRIENDS:
                console.log("Processing friends notification");
                const friendsList = await getFriends(userId);
                if (friendsList.length > 0) {
                    friendsList.forEach(friend => {
                        emitSocketEvent(io, friend.friendUserId.toString(), 'notification', { userId,payload, message, url, type });
                    });
                }
                break;

            case NotificationTypesEnum.GROUP:
                console.log("Processing group notification");
                break;

            case NotificationTypesEnum.INDIVIDUAL:
                if (!reciever) break;
                console.log("Processing individual notification");
                emitSocketEvent(io, reciever.toString(), 'notification', { userId,payload, message, url, type });
                break;

            default:
                console.log("Unknown notification type");
        }
    } catch (error) {
        console.error('Error processing job:', job.id, error);
    }
}, { connection: redisConnection });

export { worker };
