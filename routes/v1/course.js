const express = require("express");
const router = express.Router();

const courseCont = require("../../controllers/v1/course");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { requireJsonBody } = require("../../middlewares/http");
const { courseCoverUpload } = require("../../middlewares/upload");

router.get("/", courseCont.getAllCourses);
router.get("/:id", courseCont.getCourse);

router.get("/:id/details", courseCont.getCourseDetails);

router.post("/", requireAuth, requireAdmin, courseCoverUpload.single("cover"), courseCont.createCourse);
router.patch("/:id", requireAuth, requireAdmin, requireJsonBody, courseCont.updateCourse);
router.delete("/:id", requireAuth, requireAdmin, courseCont.deleteCourse);

module.exports = router;