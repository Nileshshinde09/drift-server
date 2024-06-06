import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { limiter } from "./middlewares/rateLimiter.middleware.js";
import requestIp from "request-ip";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173/")
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next()
}) 

app.use(requestIp.mw());
app.use(limiter);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());


//HealthCheck route
//-------------------------------------------------------------
import healthcheck from "./routes/healthcheck.routes.js";
app.use("/api/v1/healthcheck", healthcheck)
//-------------------------------------------------------------

//User Routes
//-------------------------------------------------------------
import userRoter from "./routes/user.routes.js"
app.use("/api/v1/users", userRoter)
//-------------------------------------------------------------


//Content Upload Routes
//-------------------------------------------------------------
import uploaderRouter from "./routes/uploader.routes.js"
app.use("/api/v1/uploader",uploaderRouter)
//-------------------------------------------------------------

//Content File delete Routes
//-------------------------------------------------------------
import fileRemoverRouter from "./routes/fileRemover.routes.js"
app.use("/api/v1/fileremover",fileRemoverRouter)
//-------------------------------------------------------------

//Content File delete Routes
//-------------------------------------------------------------
import loadAssetsRouter from "./routes/assetLoader.routes.js"
app.use("/api/v1/fileloader",loadAssetsRouter)
//-------------------------------------------------------------

//Follow Operations Routes
//-------------------------------------------------------------
import followRouter from "./routes/follow.routes.js"
app.use("/api/v1/follow",followRouter)
//-------------------------------------------------------------

//Friend Operations Routes
//-------------------------------------------------------------
import friendsRouter from "./routes/friends.routes.js"
app.use("/api/v1/friends",friendsRouter)
//-------------------------------------------------------------


//Post Operations Routes
//-------------------------------------------------------------
import PostRouter from "./routes/post.routes.js"
app.use("/api/v1/post",PostRouter)
//-------------------------------------------------------------

//Post Operations Routes
//-------------------------------------------------------------
import FindRouter from "./routes/find.routes.js"
app.use("/api/v1/find",FindRouter)
//-------------------------------------------------------------

//comments Operations Routes
//-------------------------------------------------------------
import CommentsRouter from "./routes/comment.routes.js"
app.use("/api/v1/comment",CommentsRouter)
//-------------------------------------------------------------

//Bookmarks Operations Routes
//-------------------------------------------------------------
import BookmarkRouter from "./routes/bookmark.routes.js"
app.use("/api/v1/bookmark",BookmarkRouter)
//-------------------------------------------------------------

//Likes Operations Routes
//-------------------------------------------------------------
import LikesRouter from "./routes/likes.routes.js"
app.use("/api/v1/likes",LikesRouter)
//-------------------------------------------------------------

//Profile Operations Routes
//-------------------------------------------------------------
import ProfileRouter from "./routes/profile.routes.js"
app.use("/api/v1/profile",ProfileRouter)
//-------------------------------------------------------------

export { app };