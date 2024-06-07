import { NotificationTypesEnum, SocketEventEnum } from "../../constants.js"
import { Worker } from "bullmq"
import { redisConnection } from "../../redis/index.js"
import { getFollowers, getFriends } from "../../utils"
import { app } from "../../app.js"
const io = app.get('io')
new Worker('send-notification', async (job) => {
    
    console.log('Processing job:', job.id);
    console.log('Notification data:', job.data);

    const { userId, message = "", url = null } = job.data;
    switch (job.data?.type) {
        case NotificationTypesEnum.FOLLOWERS:
            const followersList = await getFollowers(userId)
            if (followersList[0]) {
                followersList.forEach(follower => {
                    emitSocketEvent(io, follower.followeeId.toString(), 'notification', { userId, message, url, type });
                });
            }
            break;

        case NotificationTypesEnum.FRIENDS:
            const friendsList = await getFriends(userId)
            if (friendsList[0]) {
                friendsList.forEach(friend => {
                    emitSocketEvent(io, friend.friendUserId.toString(), 'notification', { userId, message, url, type });
                });
            }
            break;

        case NotificationTypesEnum.GROUP:
            console.log("group")
            break;
        case NotificationTypesEnum.INDIVIDUAL:
            console.log("individual")
            break;
    }


}, { redisConnection });
