const Joi = require("joi");

const userRegisterValidate = (data) => {
  const userSchema = Joi.object({
    username: Joi.string().required().max(30),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).max(30).required(),
  });

  return userSchema.validate(data);
};

const userLoginValidate = (data) => {
  const userSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).max(30).required(),
  });

  return userSchema.validate(data);
};

const blogValidate = (data) => {
  const blogSchema = Joi.object({
    title: Joi.string().max(300).required(),
    content: Joi.string().min(100).required(),
    author: Joi.string().required(),
    thumbnail: Joi.string(),
    topic: Joi.string(),
  });
  return blogSchema.validate(data);
};

module.exports = { userRegisterValidate, userLoginValidate, blogValidate };
