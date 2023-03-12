const blogSchema = require("../models/blog.model");
const userSchema = require("../models/user.model");
const bookmarkSchema = require("../models/bookmark.model");

const createError = require("http-errors");

class BookmarkController {
  async getBookmarks(req, res, next) {
    try {
      console.log("GET BOOKMARKS");
      const user_id = req.payload.userId;
      const isExitUser = await userSchema.findOne({ _id: user_id });
      if (!isExitUser) {
        return res.json({
          status: 404,
          message: "You must login",
        });
      }

      const allBookmarks = await bookmarkSchema.findOne({ user_id }).populate({
        path: "blogs.blog_id",
        select: ["title", "author"],
        populate: { path: "author", select: ["username"] },
      });
      res.status(200).json({
        status: "success",
        data: allBookmarks.blogs,
      });
    } catch (error) {
      next(error);
    }
  }

  async tonggleBookmark(req, res, next) {
    try {
      const { blog_id } = req.params;
      const user_id = req.payload.userId;

      // validate

      const isExitUser = await userSchema.findOne({ _id: user_id });
      let isBookmarked = false;

      // const isExitBlog = await blogSchema.findOne({ blog: blog_id });
      // if(!isExitBlog) {
      //   return res.json({
      //     status: 404,
      //     message: "Something was wrong",
      //   });
      // }
      const isExitBookmark = await bookmarkSchema.findOne({ user_id });
      // when bookmarks schema no have document
      if (!isExitBookmark) {
        const newBookmark = new bookmarkSchema({
          user_id,
          blogs: { blog_id },
        });

        const bookmark = await newBookmark.save();

        // when bookmarks schema no have document
        isBookmarked = true;
        if (bookmark) {
          return res.status(200).json({
            status: "success",
            data: {
              isBookmarked,
              // bookmarks: bookmark.blogs,
            },
          });
        }
      } else {
        // check blog exit in bookmarks
        const isExitBlog = await bookmarkSchema.findOne({
          user_id,
          "blogs.blog_id": blog_id,
        });

        let newBookmark;
        if (isExitBlog) {
          console.log("UnBookmark");
          newBookmark = await bookmarkSchema.findOneAndUpdate(
            { user_id, "blogs.blog_id": blog_id },
            { $pull: { blogs: { blog_id } } },
            { new: true }
          );
        } else {
          console.log("Bookmark ");
          newBookmark = await bookmarkSchema.findOneAndUpdate(
            { user_id },
            { $push: { blogs: { blog_id } } },
            { new: true }
          );
          isBookmarked = true;
        }

        return res.status(200).json({
          status: "success",
          data: {
            isBookmarked: isBookmarked,
            // bookmarks: newBookmark.blogs,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async removeBookmark(req, res, next) {
    try {
      console.log("REMOVE BOOKMARK");
      const { blog_id } = req.params;
      const user_id = req.payload.userId;

      // validate

      const isExitBlog = await blogSchema.findOne({ _id: blog_id });
      if (!isExitBlog) {
        return res.json({
          status: 404,
          message: "Something was wrong",
        });
      }

      // check blog exit in bookmarks
      // const isExitBlog = await bookmarkSchema.findOne({
      //   user_id,
      //   "blogs.blog_id": blog_id,
      // });

      console.log("UnBookmark");
      const newBookmark = await bookmarkSchema
        .findOneAndUpdate(
          { user_id, "blogs.blog_id": blog_id },
          { $pull: { blogs: { blog_id } } },
          { new: true }
        )
        .populate({
          path: "blogs.blog_id",
          select: ["title", "author"],
          populate: { path: "author", select: ["username"] },
        });

      return res.status(200).json({
        status: "success",
        data: newBookmark.blogs,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkBookmarked(req, res, next) {
    try {
      console.log("CHECK BOOKMARK");
      const { blog_id } = req.params;
      const user_id = req.payload.userId;

      const isExitUser = await userSchema.findOne({ _id: user_id });
      if (!isExitUser) {
        return res.json({
          status: 404,
          message: "You must login",
        });
      }

      const isExitBlog = await bookmarkSchema.findOne({
        user_id,
        blogs: { $elemMatch: { blog_id } },
      });

      if (!isExitBlog) {
        return res.json({
          status: "success",
          data: { isBookmarked: false },
        });
      } else {
        return res.json({
          status: "success",
          data: { isBookmarked: true },
        });
      }
    } catch (error) {}
  }
}

module.exports = new BookmarkController();
