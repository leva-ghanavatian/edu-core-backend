const express = require("express");
const router = express.Router();
const ticketCont = require("../../controllers/v1/ticketCont");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { requireJsonBody } = require("../../middlewares/http");

// --- User Routes ---
router.post("/", requireAuth, requireJsonBody, ticketCont.createTicket);
router.get("/user", requireAuth, ticketCont.getUserTickets);
router.get("/:id/answer", requireAuth, ticketCont.getTicketAnswer);

// --- Admin Routes ---
router.get("/", requireAuth, requireAdmin, ticketCont.getUnansweredTickets);
router.post("/answer", requireAuth, requireAdmin, requireJsonBody, ticketCont.setAnswer);

module.exports = router;