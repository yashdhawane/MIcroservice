const express = require("express");
const multer = require("multer");

const {
    uploadMedia
} =require("../controller/media-controller");
const logger = require("../utils/logger");
const authenticateRequest = require("../middleware/auth-middleware");

const router = express.Router();

//configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");


router.post("/upload", authenticateRequest, 
    (req, res, next) => {
        logger.info("Starting media upload");
        upload(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            logger.error("Multer Error while  uploading file", error);
            return res.status(400).json({
            success: false,
            message: "Multer Error while uploading file",
            error: error.message,
            stack: error.stack,
            });
        }else if (error) {    
                logger.error("Unknown error occured while uploading:", err);
        return res.status(500).json({
          message: "Unknown error occured while uploading:",
          error: err.message,
          stack: err.stack,
        });
        }

         if (!req.file) {
        return res.status(400).json({
          message: "No file found!",
        });
      }


        next();
        });
    },
    uploadMedia
    );

   module.exports = router;