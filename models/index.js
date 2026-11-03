const userModel = require("./User");
const bannedModel = require("./Banned"); // If it has an init()
const categoryModel = require("./Category");
const courseModel = require("./Course");
const sessionModel = require("./Session");
const commentModel = require("./Comment");

const initModels = () => Promise.all([
    userModel.init(),
    bannedModel.init(),
    categoryModel.init(),
    courseModel.init(),
    sessionModel.init(),
    commentModel.init(),
]);

module.exports = { initModels };