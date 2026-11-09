const userModel = require("./User");
const bannedModel = require("./Banned");
const categoryModel = require("./Category");
const courseModel = require("./Course");
const courseUserModel = require("./CourseUser");
const sessionModel = require("./Session");
const commentModel = require("./Comment");

const initModels = () => Promise.all([
    userModel.init(),
    bannedModel.init(),
    categoryModel.init(),
    courseModel.init(),
    courseUserModel.init(),
    sessionModel.init(),
    commentModel.init(),
]);

module.exports = { initModels };