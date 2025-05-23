require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mediaRoutes = require("../routes/media-routes");
const errorHandler = require("../middleware/errorhandler");
const logger = require("../utils/logger");
// const Redis = require("ioredis");
// const redisClient = new Redis(process.env.REDIS_URL);
const { RedisStore } = require("rate-limit-redis");
const rateLimit = require("express-rate-limit");
const { connectToRabbitMQ, consumeEvent } = require("../utils/rabbitmq");
const { handlePostDeleted } = require("../eventHandler/media-event-handler");
const app = express();
const PORT = process.env.PORT || 3004;

//connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));


app.use(cors());
app.use(helmet());
app.use(express.json());


app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

// const sensitiveEndpointsLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 50,
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
//     res.status(429).json({ success: false, message: "Too many requests" });
//   },
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.call(...args),
//   }),
// });


app.use("/api/media", mediaRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    //consume all the events
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Media service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (reason,promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason instanceof Error ? reason.stack : JSON.stringify(reason));
   
})