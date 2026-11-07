const express = require("express");
const router = express.Router();

const courseCont = require("../../controllers/v1/course");
const sessionCont = require("../../controllers/v1/session");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { requireJsonBody } = require("../../middlewares/http");
const { courseCoverUpload, courseVideoUpload } = require("../../middlewares/upload");

router.get("/", courseCont.getAllCourses);
router.get("/:id", courseCont.getCourse);

router.get("/:id/details", courseCont.getCourseDetails);

router.post("/", requireAuth, requireAdmin, courseCoverUpload.single("cover"), courseCont.createCourse);
router.post("/:id/sessions", requireAuth, requireAdmin, courseVideoUpload.single("video"), sessionCont.createSession);
router.patch("/:id", requireAuth, requireAdmin, requireJsonBody, courseCont.updateCourse);
router.delete("/:id", requireAuth, requireAdmin, courseCont.deleteCourse);
router.delete("/:id/sessions", requireAuth, requireAdmin, sessionCont.deleteSession);

module.exports = router;