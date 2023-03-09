const express = require('express');
const router = express.Router();
const BlogController = require('../controller/blog.cont');
const {verifyAccessToken} = require('../hepler/jwt');

router.get('/', BlogController.getBlogs)
router.post('/suggestion', BlogController.suggetBlog)
router.post('/create',verifyAccessToken, BlogController.createBlog)
router.get('/:id', BlogController.getBlogById)

module.exports = router;