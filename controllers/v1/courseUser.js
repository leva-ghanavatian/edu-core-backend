const courseUserModel = require("../../models/CourseUser");
const courseModel = require("../../models/Course");
const offModel = require("../../models/Off");
const { parseId } = require("../../src/parsing/id");
const { NotFoundError, ConflictError } = require("../../helpers/errors");

const enrollInCourse = async (req, res) => {

    // 1. Get IDs
    const courseId = parseId(req.params.id); // From the URL
    const userId = parseId(req.user.sub);    // From the JWT token

    const { code } = req.body;

    // 2. Verify the course exists and get its REAL price
    const course = await courseModel.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");

    let finalPrice = course.price;

    // If they sent a code, try to consume it NOW during checkout
    if (code) {
        const consumedOff = await offModel.consumeCode(courseId, code);
        if (!consumedOff) {
            throw new ConflictError("The discount code is no longer valid.");
        }

        // Apply the discount
        const discountAmount = (course.price * consumedOff.percent) / 100;
        finalPrice = Math.max(0, course.price - discountAmount);
    }

    // 3. Create enrollment with the actual database price
    const enrollment = await courseUserModel.create({
        course: courseId,
        user: userId,
        price: finalPrice // Secure! Ignored whatever the user sent in req.body
    });

    res.status(201).json(enrollment);
};

const getMyCourses = async (req, res, next) => {
    try {
        const userId = parseId(req.user.sub);
        const myCourses = await courseUserModel.findByUser(userId);
        res.json(myCourses);
    } catch (error) { next(error); }
};

module.exports = { enrollInCourse, getMyCourses };