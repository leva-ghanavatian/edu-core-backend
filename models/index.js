const userModel = require("./User");
const bannedModel = require("./Banned");
const categoryModel = require("./Category");
const courseModel = require("./Course");
const courseUserModel = require("./CourseUser");
const sessionModel = require("./Session");
const commentModel = require("./Comment");
const contactModel = require("./Contact");
const notificationModel = require("./Notification");
const departmentModel = require("./Department");
const subDepartmentModel = require("./SubDepartment");
const menuModel = require("./Menu");

const initModels = () => Promise.all([
    userModel.init(),
    bannedModel.init(),
    categoryModel.init(),
    courseModel.init(),
    courseUserModel.init(),
    sessionModel.init(),
    commentModel.init(),
    contactModel.init(),
    notificationModel.init(),
    departmentModel.init(),
    subDepartmentModel.init(),
    menuModel.init()
]);

module.exports = { initModels };