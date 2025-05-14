const express = require("express");
const {
  createPost
} = require("../controller/post-controller");
const { authenticateRequest } = require("../middleware/authmiddleware");

const router = express.Router();

//middleware -> this will tell if the user is an auth user or not
router.use(authenticateRequest);

router.post("/create-post", createPost);


module.exports = router;