const express = require("express");
const router = express.Router();
const BookmarkController = require("../controller/bookmark.cont");
const { verifyAccessToken } = require("../hepler/jwt");

router.get("/", verifyAccessToken, BookmarkController.getBookmarks);
router.post("/:blog_id", verifyAccessToken, BookmarkController.tonggleBookmark);
router.patch("/:blog_id", verifyAccessToken, BookmarkController.removeBookmark);
router.get("/check/:blog_id", verifyAccessToken, BookmarkController.checkBookmarked);

module.exports = router;
