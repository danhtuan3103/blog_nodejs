const commentSchema = require("../models/comment.model");
const blogSchema = require("../models/blog.model");
const userSchema = require("../models/user.model");

const createError = require("http-errors");

class CommentController {
  async getComments(req, res, next) {
    try {
      console.log('GET COMMENT')

      const blog_id = req.params.id;
      const _blog_id = new RegExp(`^${blog_id}`);
      const comments = await commentSchema
        .find({ blog_id: _blog_id })
        .populate({
          path: "comments.author",
          select: ["_id", "username", "avatar"],
        });

      const commentArray = comments.reduce((init, comment) => {
        return init.concat(comment.comments);
      }, []);

      res.json({
        status: "success",
        data: commentArray || [],
      });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req, res, next) {
    try {
      console.log('ADD COMEMENT')

      const blog_id = req.params.id;
      const _blog_id = new RegExp(`^${blog_id}`);
      const { content, isRoot, parrent } = req.body;

      const author = req.payload.userId;

      const isUser = await userSchema.findOne({_id : author});
      if(!isUser) {
        return next(createError.Unauthorized());
      }


      const isOld = await commentSchema.findOne({ blog_id: blog_id });
      if (!isOld) {
        const comment = new commentSchema({
          blog_id: blog_id,
          max: 1,
          comments: {
            author,
            content,
            isRoot,
            parrent,
          },
        });

        const newComent = await comment.save();
        const comments = await commentSchema
          .find({ blog_id: _blog_id })
          .populate({
            path: "comments.author",
            select: ["_id", "username", "avatar"],
          });

        if (newComent) {
          const newBlog = await blogSchema.findOneAndUpdate(
            { _id: blog_id },
            {
              comment: { comment_id: comment._id, count: 1 },
            },
            { new: true }
          );
          const _comments = await commentSchema
            .find({ blog_id: _blog_id })
            .populate({
              path: "comments.author",
              select: ["_id", "username", "avatar"],
            });

          const commentArray = _comments.reduce((init, comment) => {
            return init.concat(comment.comments);
          }, []);

          if (newBlog) {
            return res
              .status(200)
              .send({ status: "success", data: commentArray || [] });
          }
        }
        // console.log("Hello ",newComent);
      } else {
        const comment = await commentSchema.findOneAndUpdate(
          {
            blog_id: _blog_id,
            max: { $lt: 10 },
          },
          {
            $push: {
              comments: {
                author,
                content,
                isRoot,
                parrent,
              },
            },
            $inc: { max: 1 },
            $setOnInsert: { blog_id: `${blog_id}_${new Date().getTime()}` },
          },
          {
            new: true,
            upsert: true,
          }
        );

        if (comment) {
          const newBlog = await blogSchema.findOneAndUpdate(
            { _id: blog_id },
            {
              $inc: { "comment.count": 1 },
            },
            { new: true }
          );

          if (newBlog) {
            const comments = await commentSchema
              .find({ blog_id: _blog_id })
              .populate({
                path: "comments.author",
                select: ["_id", "username", "avatar"],
              });

            const commentArray = comments.reduce((init, comment) => {
              return init.concat(comment.comments);
            }, []);

            res.json({
              status: "success",
              data: commentArray || [],
            });
          }
        }
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
