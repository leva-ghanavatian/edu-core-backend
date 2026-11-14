const express = require("express");
const router = express.Router();
const offCont = require("../../controllers/v1/offCont");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { requireJsonBody } = require("../../middlewares/http");

// route to check a code
router.get("/validate", requireAuth, offCont.validateOff);

router.post("/", requireAuth, requireAdmin, requireJsonBody, offCont.createOff);
router.get("/course/:courseId", requireAuth, requireAdmin, offCont.getCourseOffs);
router.delete("/:id", requireAuth, requireAdmin, offCont.deleteOff);

module.exports = router;