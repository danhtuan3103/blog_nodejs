const express = require("express");
const router = express.Router();
const LikeController = require("../controller/like.cont");
// const {verifyAccessToken} = require('../hepler/jwt');
const { verifyAccessToken } = require("../hepler/jwt");

router.post("/", verifyAccessToken, LikeController.tonggleLike);
router.get("/check/:blog_id", verifyAccessToken, LikeController.checkLikedUser);

module.exports = router;
