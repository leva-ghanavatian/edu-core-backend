const express = require("express");
const router = express.Router();
const menuCont = require("../../controllers/v1/menuCont");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { requireJsonBody } = require("../../middlewares/http");

// Public routes
router.get("/", menuCont.getAllMenus);

// Admin routes
router.get("/all", requireAuth, requireAdmin, menuCont.getAllMenusPanel);
router.post("/", requireAuth, requireAdmin, requireJsonBody, menuCont.createMenu);
router.delete("/:id", requireAuth, requireAdmin, menuCont.deleteMenu);

module.exports = router;