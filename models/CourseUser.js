const DB = require("../configs/database");
const { ConflictError } = require("../helpers/errors");

const getCollection = async () => (await DB.getDb()).collection("course_users");

const init = async () => {
    const courseUsers = await getCollection();
    await courseUsers.createIndexes([
        // 1. Prevent duplicate enrollments (A user can only buy a course once)
        { key: { course: 1, user: 1 }, name: "unique_enrollment", unique: true },
        // 2. Fast lookup for "My Courses" (User dashboard)
        { key: { user: 1 }, name: "enrollments_by_user" },
        // 3. Fast lookup for "Who bought this course" (Admin dashboard)
        { key: { course: 1 }, name: "enrollments_by_course" }
    ]);
};

const rethrowDuplicate = error => {
    if (error.code === 11000) {
        throw new ConflictError("You are already enrolled in this course.");
    }
    throw error;
};

const create = async ({ course, user, price }) => {
    const courseUsers = await getCollection();
    const enrollment = {
        course,
        user,
        price, // Snapshot of the price at the time of purchase
        createdAt: new Date()
    };

    try {
        const { insertedId } = await courseUsers.insertOne(enrollment);
        return { ...enrollment, _id: insertedId };
    } catch (error) {
        rethrowDuplicate(error);
    }
};

// get all courses a user owns, WITH the course details attached
const findByUser = async (userId) => {
    const courseUsers = await getCollection();
    return courseUsers.aggregate([
        { $match: { user: userId } },
        {
            $lookup: {
                from: "courses",
                localField: "course",
                foreignField: "_id",
                as: "courseDetails"
            }
        },
        { $unwind: { path: "$courseDetails", preserveNullAndEmptyArrays: true } }
    ]).toArray();
};

const isUserEnrolled = async (courseId, userId) => {
    const courseUsers = await getCollection();
    
    const enrollment = await courseUsers.findOne(
        { course: courseId, user: userId },
        { projection: { _id: 1 } }
    );
    
    return !!enrollment; // Returns true if found, false if null
};

module.exports = { init, create, findByUser, isUserEnrolled };