import cookie from "cookie";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ACCESS_TOKEN_SECRET, SocketEventEnum } from "../constants.js";

const initializeSocketIO = (io) => {
    return io.on("connection", async (socket) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

            let token = cookies?.accessToken;

            if (!token) {
                token = socket.handshake.auth?.token;
            }

            if (!token) {
                throw new ApiError(401, "Un-authorized handshake. Token is missing");
            }

            const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

            const user = await User.findById(decodedToken?._id).select(
                "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
            );


            if (!user) {
                throw new ApiError(401, "Un-authorized handshake. Token is invalid");
            }

            socket.user = user;
            socket.join(user._id.toString());
            socket.emit(SocketEventEnum.CONNECTED_EVENT);
            
            console.log("User connected 🗼. userId: ", user._id.toString());
            
            socket.on(SocketEventEnum.DISCONNECT_EVENT, async () => {
                console.log("user has disconnected 🚫. userId: " + socket.user?._id);
                if (socket.user?._id) {
                    socket.leave(socket.user._id);
                }
                await User.findByIdAndUpdate(
                    user._id,
                    {
                        status:"Offline"
                    }
                )
            });

        } catch (error) {
            socket.emit(
                SocketEventEnum.SOCKET_ERROR_EVENT,
                error?.message || "Something went wrong while connecting to the socket."
            );
        }
    });
};


const emitSocketEvent = (io, roomId, event, payload) => {
    io.in(roomId).emit(event, payload);
};

export { initializeSocketIO, emitSocketEvent };
