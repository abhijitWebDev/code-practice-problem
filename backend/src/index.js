import express from "express"
import dotenv from "dotenv"
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executionRoute from "./routes/executeCode.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import submissionRoutes from "./routes/submission.route.js";
import cors from 'cors'


dotenv.config();

const app = express();
const port = process.env.PORT || 3000


app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
        origin:["http://localhost:5173"],
        credentials:true
    })
)

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes)
app.use("/api/v1/execute-code",executionRoute)
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes)

app.get("/", (req, res)=> {
    res.send("Hello Guys welcome to Leetlab 🔥")
})
app.listen(process.env.PORT, () => {
    console.log(`Server is listening on ${port}`);
})