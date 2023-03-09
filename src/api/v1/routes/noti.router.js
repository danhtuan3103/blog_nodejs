const express = require("express");
const router = express.Router();
const NotiController = require("../controller/noti.cont");
// const {verifyAccessToken} = require('../hepler/jwt');
const { verifyAccessToken } = require("../hepler/jwt");

router.get("/readed", verifyAccessToken, NotiController.readAll);
router.get("/readed/:id", verifyAccessToken, NotiController.readOne);
router.get("/", verifyAccessToken,NotiController.getNotification);
router.get("/:id", NotiController.getNotificationById);

module.exports = router;
