const express = require('express');
const router = express.Router();
const FeedbackController = require('../controller/feedback.cont');


router.post('/', FeedbackController.sendFeedback);
router.get('/', FeedbackController.getAllFeedback);

module.exports = router;