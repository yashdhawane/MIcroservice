const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const {rateLimit} = require('express-rate-limit');
const Redis = require('ioredis');
const { RateLimiterRedis } = require("rate-limiter-flexible");
const dotenv = require('dotenv');
dotenv.config();
const logger = require('../utils/logger');
const errorHandler = require('../middleware/errorhandler');
const routes = require('../routes/identity-service');


const app = express();  
const PORT = process.env.PORT || 3001;


mongoose.connect(process.env.MONGO_URI).then(() => {
    logger.info('MongoDB connected');
}).catch((err) => {
    logger.error('MongoDB connection error', err);
    process.exit(1);
    })

const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
  });

