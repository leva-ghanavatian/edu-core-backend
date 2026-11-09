const express = require("express");
const { requireJsonBody } = require("../../middlewares/http");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const userCont = require("../../controllers/v1/user");
const courseUserCont = require("../../controllers/v1/courseUser");

const router = express.Router();

router.get("/", requireAuth, requireAdmin, userCont.getAllUsers);
router.get("/my-courses", requireAuth, courseUserCont.getMyCourses);
router.get("/:id", requireAuth, requireAdmin, userCont.getUser);
router.patch("/me", requireAuth, userCont.updateMyProfile);
router.patch("/:id/upgrade", requireAuth, requireAdmin, userCont.upgradeUser);
router.patch("/:id/penalty", requireAuth, requireAdmin, requireJsonBody, userCont.updateCrime);
router.patch("/:id", requireAuth, requireAdmin, requireJsonBody, userCont.updateUser);
router.post("/ban", requireAuth, requireAdmin, requireJsonBody, userCont.banUser);
router.delete("/:id", requireAuth, requireAdmin, userCont.deleteUser);

module.exports = router;