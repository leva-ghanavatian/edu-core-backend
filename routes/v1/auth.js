const express = require("express");
const { requireJsonBody } = require("../../middlewares/http");
const { requireAuth } = require("../../middlewares/auth");
const auth = require("../../controllers/v1/auth");

const router = express.Router();

router.post("/register", requireJsonBody, auth.registerUser);
router.post("/login", requireJsonBody, auth.loginUser);
router.post("/refresh", auth.refreshToken);
router.get("/me", requireAuth, auth.getMe);

module.exports = router;