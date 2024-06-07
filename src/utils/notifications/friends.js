import { ApiError } from "../ApiError"
import { FriendRequests } from "../../models/friendRequest.model.js"
export const getFriends = async (userId) => {
    if (!userId) throw new ApiError(
        404,
        "UserId not found."
    )
    try {
        const friendList = await FriendRequests.aggregate([
            {
                $match: {
                    $and: [
                        { status: true },
                        {
                            $or: [{ sender: userId }, { receiver: userId }]
                        }
                    ]
                }
            },
            {
                $addFields: {
                    friendUserId: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$receiver",
                            else: "$sender"
                        }
                    }
                }
            }
        ]);

        return friendList?friendList:[];

    } catch (error) {
        console.log(error.message || "Something went wrong while fetching user data.");
        throw new ApiError(
            500,
            error.message || "Something went wrong while fetching user data."
        )
    }
}
