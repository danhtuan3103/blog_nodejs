const blogSchema = require("../models/blog.model");
const userSchema = require("../models/user.model");

const { blogValidate } = require("../hepler/validate");
const createError = require("http-errors");

class BlogController {
  async getBlogs(req, res, next) {
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
  }

  async suggetBlog(req, res, next) {
    try {
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
      const blog = await blogSchema
        .findOne({ _id: req.params.id })
        .populate("author");

      return res.json({
        status: "success",
        data: blog,
      });
    } catch (error) {
      next(error);
    }
    const id = req.params.id;
  }

  async createBlog(req, res, next) {
    try {
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
