const blogRouter = require('./blog.router')
const userRouter = require('./user.router')
const likeRouter = require('./like.router')
const commentRouter = require('./comment.router')
const bookmarkRouter = require('./bookmark.router')
const notiRouter = require('./noti.router')
const feedbackRouter = require('./feedback.router')

function route (app) {

    app.get('/', (req, res) => {
        res.send("Wellcome to Blog Nodejs")
    })
    // user , token , register, login
   app.use("/api/v1/user",userRouter )

   // blog
   app.use("/api/v1/blog",blogRouter )
   app.use("/api/v1/blog/like", likeRouter )
   app.use("/api/v1/blog/comment", commentRouter )
   app.use("/api/v1/bookmark", bookmarkRouter )
   app.use("/api/v1/notifications", notiRouter )
   app.use("/api/v1/feedback", feedbackRouter )
    
   
}

module.exports = route;
 