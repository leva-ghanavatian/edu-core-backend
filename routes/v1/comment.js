const express = require("express");
const router = express.Router();

const commentCont = require("../../controllers/v1/comment");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");

// collection-level: filter by ?course=<id> via Comment.parseFilter
router.get("/", commentCont.getAllComments);

// single comment
router.delete("/:id", requireAuth, commentCont.deleteComment);

module.exports = router;