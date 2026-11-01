const express = require("express");
const router = express.Router();

const categoryCont = require("../../controllers/v1/category");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { requireJsonBody } = require("../../middlewares/http");

router.get("/", categoryCont.getAllCategories);
router.get("/:id", categoryCont.getCategory);

router.post("/", requireAuth, requireAdmin, requireJsonBody, categoryCont.createCategory);
router.patch("/:id", requireAuth, requireAdmin, requireJsonBody, categoryCont.updateCategory);
router.delete("/:id", requireAuth, requireAdmin, categoryCont.deleteCategory);

module.exports = router;