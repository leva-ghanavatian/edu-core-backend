const path = require("path");
const { safeUnlink } = require("../../helpers/files");

const COVERS_DIR = path.join(__dirname, "../../public/courses/covers");
const VIDEOS_DIR = path.join(__dirname, "../../public/courses/videos");


const courseModel = require("../../models/Course");
const sessionModel = require("../../models/Session");
const commentModel = require("../../models/Comment");

const Course = require("../../src/resources/course");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");
const { ValidationError } = require("../../helpers/errors");

const getAllCourses = async (req, res, next) => {
        const { page, limit, sort, ...filterQuery } = req.query;

        const filter = Course.parseFilter(filterQuery);
        const sortObj = Course.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const courses = await courseModel.find({
                filter, sort: sortObj, skip, limit: parsedLimit
        });

        const formattedCourses = courses.map(course => {
                if (course.cover) {
                        course.cover = `/courses/covers/${course.cover}`;
                }
                return course;
        });

        res.json(formattedCourses);
};

const getCourse = async (req, res, next) => {
        const id = parseId(req.params.id);
        const course = await courseModel.findById(id);

        if (course && course.cover) {
                // Modify the cover string to be a full path
                course.cover = `/courses/covers/${course.cover}`;
        }

        res.json(found(course, "Course"));
};

const getCourseDetails = async (req, res) => {
        const id = parseId(req.params.id);
        const course = await courseModel.getCourseDetails(id);

        if (course && course.cover) {
                // Modify the cover string to be a full path
                course.cover = `/courses/covers/${course.cover}`;
        }

        res.json(found(course, "Course"));
};

const getRelatedCourses = async (req, res) => {
        const id = parseId(req.params.id);
        const course = await courseModel.findById(id);
        found(course);

        const relatedCourses = await courseModel.find({
                filter: {
                        category: course.category,
                        _id: { $ne: id }
                },
                sort: { createdAt: -1 },
                skip: 0,
                limit: 10
        });

        res.status(200).json(relatedCourses);
}

const createCourse = async (req, res) => {
        const data = Course.parseCreate(req.body);

        if (!req.file) {
                throw new ValidationError("Course cover image is required.");
        }

        data.cover = req.file.filename;
        data.creator = parseId(req.user.sub);

        const newCourse = await courseModel.create(data);
        res.status(201).json(newCourse);
};

const updateCourse = async (req, res) => {
        const id = parseId(req.params.id);
        // The user shouldn't be able to change the creator of a course
        const data = Course.parseUpdate(req.body);

        const updatedCourse = await courseModel.update(id, data);
        res.json(found(updatedCourse, "Course"));
};

const deleteCourseCascade = async course => {
        const sessions = await sessionModel.findByCourse(course._id);

        await commentModel.removeByCourse(course._id);
        await sessionModel.removeByCourse(course._id);
        const deleted = await courseModel.remove(course._id);

        if (course.cover) {
                await safeUnlink(path.join(COVERS_DIR, course.cover));
        }
        await Promise.all(
                sessions.map(s => (s.video ? safeUnlink(path.join(VIDEOS_DIR, s.video)) : null))
        );

        return deleted;
};

const deleteCourse = async (req, res) => {
        const id = parseId(req.params.id);

        const course = await courseModel.findById(id);
        found(course, "Course");

        const deleted = await deleteCourseCascade(course);
        res.json(deleted);
};

module.exports = {
        getAllCourses, getCourse, getCourseDetails, getRelatedCourses,
        createCourse, updateCourse, deleteCourse
};