const express = require("express");
const router = express.Router();
const notificationCont = require("../../controllers/v1/notificationCont");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { requireJsonBody } = require("../../middlewares/http");

// Admin sends to a user
router.post("/", requireAuth, requireAdmin, requireJsonBody, notificationCont.sendNotification);

// User routes
router.get("/", requireAuth, notificationCont.getMyNotifications); // Gets the logged-in user's list
router.get("/:id", requireAuth, notificationCont.getNotification);
router.patch("/:id/seen", requireAuth, notificationCont.markNotificationSeen);

module.exports = router;