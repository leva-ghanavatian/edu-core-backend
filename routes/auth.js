const express = require("express");
const { requireJsonBody } = require("../middlewares/http");
const { requireAuth } = require("../middlewares/auth");
const userCont = require("../controllers/userCont");

const router = express.Router();

router.post("/register", requireJsonBody, userCont.registerUser);
router.post("/login", requireJsonBody, userCont.loginUser);
router.get("/me", requireAuth, userCont.getMe);

module.exports = router;