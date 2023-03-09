const express = require('express');
const router = express.Router();
const UserController = require('../controller/user.cont');
const {verifyAccessToken} = require('../hepler/jwt');
router.get('/',UserController.getUsers)
router.get('/:id', UserController.getUser)
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/refresh-token', UserController.refreshToken)
router.post('/logout',verifyAccessToken, UserController.logout)
router.post('/avatar',verifyAccessToken, UserController.updateAvatar)

module.exports = router;