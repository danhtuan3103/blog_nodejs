const blogSchema = require("../models/blog.model");
const userSchema = require("../models/user.model");
const likeSchema = require("../models/like.model");
const createError = require("http-errors");

class LikeController {
  async tonggleLike(req, res, next) {
    try {
      const { blog_id } = req.body;
      const user_id = req.payload.userId;

      const isUser = await userSchema.indOne({_id : user_id});

      if(!isUser) {
        return next(createError.Unauthorized());
      }
   
      const likesOfBlog = await likeSchema.findOne({ blog_id: blog_id });
      // console.log("Hello ", user_id, blog_id)

      // if like schema no have document
      if (!likesOfBlog) {
        const newLikeOfBlog = new likeSchema({
          blog_id: blog_id,
          users: { user_id },
        });
        const like = await newLikeOfBlog.save();
        // console.log(like);
        const blog = await blogSchema.findOneAndUpdate(
          { _id: blog_id },
          { like: { like_id: like._id, count: 1 } },
          { new: true }
        );

        res.json({
          status: "success",
          data: { liked: true, count: blog.like.count },
        });
      }
      // if like schema have document
      else {
        const like = await likeSchema.findOne({
          blog_id: blog_id,
          "users.user_id": user_id,
        });

        let newLike, newBlog;
        let liked, likeCount;
        if (like) {
          console.log("UnLiked");
          newLike = await likeSchema.findOneAndUpdate(
            { blog_id: blog_id, "users.user_id": user_id },
            { $pull: { users: { user_id } } },
            { new: true }
          );

          newBlog = await blogSchema.findOneAndUpdate(
            {
              _id: blog_id,
            },
            {
              $inc: { "like.count": -1 },
            },
            {
              new: true,
            }
          );
          liked = false;
          likeCount = newBlog.like.count;
        } else {
          console.log("Liked ");
          newLike = await likeSchema.findOneAndUpdate(
            { blog_id: blog_id },
            { $push: { users: { user_id } } },
            { new: true }
          );
          newBlog = await blogSchema.findOneAndUpdate(
            {
              _id: blog_id,
            },
            {
              $inc: { "like.count": 1 },
            },
            {
              new: true,
            }
          );
          liked = true;
          likeCount = newBlog.like.count;
        }

        res.json({
          status: "success",
          data: {
            liked,
            count: likeCount,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async checkLikedUser(req, res, next) {
    try {
      console.log("CHECK LIKED");
      const { blog_id } = req.params;
      const user_id = req.payload.userId;

      // Validate
      const isUser = await userSchema.findOne({_id : user_id});

      if(!isUser) {
        return next(createError.Unauthorized());
      }

      const likesOfBlog = await likeSchema.findOne({
        blog_id: blog_id,
        users: { $elemMatch: { user_id } },
      });

      if (!likesOfBlog) {
        return res.json({
          status: "success",
          data: { liked: false },
        });
      } else {
        return res.json({
          status: "success",
          data: { liked: true },
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LikeController();
