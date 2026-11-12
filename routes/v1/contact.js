const express = require("express");
const router = express.Router();
const contactCont = require("../../controllers/v1/contactCont");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { contactAttachmentUpload } = require("../../middlewares/upload");
const { requireJsonBody } = require("../../middlewares/http");

router.post("/", requireAuth, contactAttachmentUpload.single("attachment"), contactCont.submitContact);
router.post("/:id/reply", requireAuth, requireAdmin, requireJsonBody, contactCont.replyToContact);
router.get("/", requireAuth, requireAdmin, contactCont.getAllContacts);
router.patch("/:id/status", requireAuth, requireAdmin, contactCont.updateContactStatus);

module.exports = router;