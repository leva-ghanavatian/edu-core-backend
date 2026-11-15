const express = require("express");
const router = express.Router();
const departmentCont = require("../../controllers/v1/departmentCont");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const { requireJsonBody } = require("../../middlewares/http");

// Public routes (Users need to see these to select a department when submitting a ticket)
router.get("/", departmentCont.getAllDepartments);
router.get("/:id/subs", departmentCont.getSubDepartments); // Get subs for a specific department

// Admin-only routes
router.post("/", requireAuth, requireAdmin, requireJsonBody, departmentCont.createDepartment);
router.post("/subs", requireAuth, requireAdmin, requireJsonBody, departmentCont.createSubDepartment);
router.delete("/:id", requireAuth, requireAdmin, departmentCont.deleteDepartment);

module.exports = router;