const offModel = require("../../models/Off");
const courseModel = require("../../models/Course");
const Off = require("../../src/resources/off");
const { parseId } = require("../../src/parsing/id");
const { NotFoundError, ValidationError } = require("../../helpers/errors");
const found = require("../../helpers/found");

// Admin/Teacher creates a code
const createOff = async (req, res, next) => {
    try {
        const data = Off.parseCreate(req.body);
        data.creator = parseId(req.user.sub); // Inject creator from token
        
        const newOff = await offModel.create(data);
        res.status(201).json(newOff);
    } catch (error) { next(error); }
};

const validateOff = async (req, res, next) => {
    try {
        const { code, courseId } = req.query;
        
        if (!code || !courseId) {
            throw new ValidationError("Please provide both code and courseId");
        }

        const course = await courseModel.findById(parseId(courseId));
        if (!course) throw new NotFoundError("Course not found");

        // READ-ONLY check
        const validOff = await offModel.validateCode(parseId(courseId), code);
        
        if (!validOff) {
            throw new NotFoundError("Invalid, expired, or fully used discount code.");
        }

        const discountAmount = (course.price * validOff.percent) / 100;
        const finalPrice = Math.max(0, course.price - discountAmount);

        res.json({
            message: "Code applied successfully",
            originalPrice: course.price,
            discountPercent: validOff.percent,
            finalPrice: Number(finalPrice.toFixed(2))
        });
    } catch (error) { next(error); }
};

const getCourseOffs = async (req, res, next) => {
    try {
        const courseId = parseId(req.params.courseId);
        const offs = await offModel.findByCourse(courseId);
        res.json(offs);
    } catch (error) { next(error); }
};

const deleteOff = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const deleted = await offModel.remove(id);
        res.json(found(deleted, "Discount Code"));
    } catch (error) { next(error); }
};

module.exports = { createOff, validateOff, getCourseOffs, deleteOff };