import { ApiError } from "../ApiError"
import { Follows } from "../../models/follow.model.js"

export const getFollowers = async (userId) => {
    if (!userId) throw new ApiError(
        404,
        "UserId not found."
    )
    try {

        const followersList = await Follows.find(
            {
                followerId: userId
            }
        )

        return followersList ? followersList : [];

    } catch (error) {
        console.log(error.message || "Something went wrong while fetching user data.");
        throw new ApiError(
            500,
            error.message || "Something went wrong while fetching user data."
        )
    }
}
