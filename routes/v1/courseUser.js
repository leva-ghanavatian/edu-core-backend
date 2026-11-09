const express = require("express");
const router = express.Router();
const courseUserCont = require("../../controllers/v1/courseUser");
const { requireAuth } = require("../../middlewares/auth");

router.post("/:id/enroll", requireAuth, courseUserCont.enrollInCourse);
router.get("/my-courses", requireAuth, courseUserCont.getMyCourses);

module.exports = router;