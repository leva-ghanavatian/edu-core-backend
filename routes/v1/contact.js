const express = require("express");
const router = express.Router();
const contactCont = require("../../controllers/contactCont");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { contactAttachmentUpload } = require("../../middlewares/upload");

router.post(
    "/", 
    requireAdmin,
    contactAttachmentUpload.single("attachment"), 
    contactCont.submitContact
);

router.get("/", requireAuth, requireAdmin, contactCont.getAllContacts);
router.patch("/:id/status", requireAuth, requireAdmin, contactCont.updateContactStatus);

module.exports = router;