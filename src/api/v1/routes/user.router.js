const express = require("express");
const router = express.Router();
const UserController = require("../controller/user.cont");
const { verifyAccessToken } = require("../hepler/jwt");
const upload = require("../utils/upload");
const passport = require("passport");

router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/refresh-token", UserController.refreshToken);
router.post("/logout", verifyAccessToken, UserController.logout);
router.post("/signup/gg", UserController.googleSignUp);
router.post("/signin/gg", UserController.googleSignIn);
router.post("/signin/fb", UserController.fbSignIn);
router.post("/signup/fb", UserController.fbSignUp);
router.put(
  "/avatar/upload",
  verifyAccessToken,
  upload.single("file"),
  UserController.uploadAvatar
);

router.put("/avatar/update", verifyAccessToken, UserController.updateAvatar);

module.exports = router;
