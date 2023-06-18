const express = require("express");
const router = express.Router();
const CommentController = require("../controller/comment.cont");
const { verifyAccessToken } = require("../hepler/jwt");

router.get("/:id", CommentController.getComments);
router.post("/:id", verifyAccessToken, CommentController.addComment);

module.exports = router;
