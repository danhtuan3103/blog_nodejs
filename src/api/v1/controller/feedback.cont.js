const feedbackSchema = require("../models/feedback.model");

class FeedbackController {
  async sendFeedback(req, res, next) {
    try {
      console.log("ADD FEEDBACK");
      const { feedback } = req.body;
      if (feedback) {
        const newFeedback = new feedbackSchema({
          feedback: feedback,
        });

        const feed = await newFeedback.save();

        if (feed) {
          res.status(200).json({
            status: "success",
            data: feed,
          });
        } else {
          res.status(500).json({
            status: "failed",
            mesage: "Failed  save feedback",
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  async getAllFeedback(req, res, next) {
    try {
      console.log("GET ALL FEEDBACK");

      const feed = await feedbackSchema.find({});

      if (feed) {
        res.status(200).json({
          status: "success",
          data: feed,
        });
      } else {
        res.status(500).json({
          status: "failed",
          mesage: "Failed  save feedback",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeedbackController();
