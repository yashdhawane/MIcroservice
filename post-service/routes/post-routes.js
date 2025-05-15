const express = require("express");
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../controller/post-controller");
const { authenticateRequest } = require("../middleware/authmiddleware");

const router = express.Router();

//middleware -> this will tell if the user is an auth user or not
router.use(authenticateRequest);

router.post("/create-post", createPost);
router.get("/all-posts", getAllPosts);
router.get("/:id",getPost)
router.delete("/delete-post/:id", deletePost);
module.exports = router;