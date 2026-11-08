const express = require("express");
const router = express.Router();

const sessionCont = require("../../controllers/v1/session");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { requireJsonBody } = require("../../middlewares/http");

router.get("/", sessionCont.getAllSessions);
router.get("/:id", sessionCont.getSession);
router.patch("/:id", requireAuth, requireAdmin, requireJsonBody, sessionCont.updateSession);
router.delete("/:id", requireAuth, requireAdmin, sessionCont.deleteSession);

module.exports = router;