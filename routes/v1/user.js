const express = require("express");
const { requireJsonBody } = require("../../middlewares/http");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const userCont = require("../../controllers/user");

const router = express.Router();

router.get("/", requireAuth, requireAdmin, userCont.getAllUsers);
router.get("/:id", requireAuth, requireAdmin, userCont.getUser);
router.patch("/:id/upgrade", requireAuth, requireAdmin, userCont.upgradeUser);
router.patch("/:id", requireAuth, requireAdmin, requireJsonBody, userCont.updateCrime);
router.post("/ban", requireAuth, requireAdmin, requireJsonBody, userCont.banUser);
router.delete("/:id", requireAuth, requireAdmin, userCont.deleteUser);

module.exports = router;