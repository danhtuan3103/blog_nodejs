const blogSchema = require("../models/blog.model");
const userSchema = require("../models/user.model");

const { blogValidate } = require("../hepler/validate");
const createError = require("http-errors");

class BlogController {
  async getBlogs(req, res, next) {
    try {
      console.log("GET ALL BLOGS");
      const { topic, q } = req.query;

      let queryObject = {};
      if (topic) {
        if (topic === "All") {
          queryObject = queryObject;
        } else {
          queryObject.topic = topic;
        }
      } else if (q) {
        queryObject = {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { content: { $regex: q, $options: "i" } },
          ],
        };
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      let blogs = await blogSchema
        .find(queryObject)
        .populate("author")
        .skip(skip)
        .limit(limit);

      return res.json({
        status: "success",
        data: blogs,
      });
    } catch (error) {
      next(error);
    }
  }

  async suggetBlog(req, res, next) {
    try {
      console.log("SUGGEST ALL BLOGS");

      const { topic, author } = req.body;
      // console.log(req.body);
      const queryObject = {
        $or: [{ author: author }, { topic: { $in: topic } }],
      };

      // console.log(queryObject);

      let blogs = await blogSchema.find(queryObject, {
        _id: 1,
        thumbnail: 1,
        title: 1,
      });

      // console.log(blogs);
      return res.json({
        status: "success",
        data: blogs,
      });
    } catch (e) {
      next(e);
    }
  }

  async getBlogById(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.json(401).json({
          status: "failed",
          message: "Khon co blog",
        });
      }
      const blog = await blogSchema.findOne({ _id: id }).populate("author");

      return res.json({
        status: "success",
        data: blog,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBlog(req, res, next) {
    try {
      console.log("CREATE BLOG");

      const { title, content, author, thumbnail = null, topic } = req.body;
      const isExit = await userSchema.find({ _id: author._id });
      const _topic = topic.split(",");

      if (isExit) {
        const { error } = blogValidate({ title, content, author, topic });

        if (error) {
          throw createError(error.details[0].message);
        }

        const blog = new blogSchema({
          title: title,
          content: content,
          author: author,
          thumbnail: thumbnail,
          topic: _topic,
        });

        const savedBlog = await blog.save();

        if (!!savedBlog) {
          const authorUser = await userSchema.findOneAndUpdate(
            { _id: author },
            {
              $push: {
                blogs: savedBlog,
              },
            },
            {
              new: true,
            }
          );

          if (!!authorUser) {
            res.status(200).json({
              status: "success",
              data: savedBlog,
            });
          }
        }
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BlogController();
