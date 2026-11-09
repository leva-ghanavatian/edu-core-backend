require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = require("./app");
const authRouter = require("./routes/v1/auth");
const userRouter = require("./routes/v1/user");
const categoryRouter = require("./routes/v1/category");
const courseRouter = require("./routes/v1/course");
const sessionRouter = require("./routes/v1/session");
const commentRouter = require("./routes/v1/comment");

const { notFound, errorHandler, camelcase } = require("./middlewares/http");
const { initModels } = require("./models/index");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(camelcase);


// --- Routes ---
app.use("/v1/auth", authRouter);
app.use("/v1/user", userRouter);
app.use("/v1/category", categoryRouter);
app.use("/v1/course", courseRouter);
app.use("/v1/session", sessionRouter);
app.use("/v1/comment", commentRouter);

// --- Error Handling  ---
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        // Initialize Database Collections & Indexes
        await initModels();
        console.log("Database initialized successfully.");

        // Start listening only after DB is ready
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to initialize database:", error);
        process.exit(1); // Kill the server if DB fails
    }
};

startServer();