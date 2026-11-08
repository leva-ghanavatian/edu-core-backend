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
const unlink = require("../../helpers/files");
const { ValidationError } = require("../../helpers/errors");
const { log } = require("console");

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
        const course = await courseModel.getCourseDetails(id);

        if (course && course.cover) {
                // Modify the cover string to be a full path
                course.cover = `/courses/covers/${course.cover}`;
        }

        res.json(found(course, "Course"));
};

const getCourseDetails = async (req, res) => {
        const id = parseId(req.params.id);
        const course = await courseModel.findWithDetails(id);

        if (course && course.cover) {
                // Modify the cover string to be a full path
                course.cover = `/courses/covers/${course.cover}`;
        }

        res.json(found(course, "Course"));
};

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

const deleteCourse = async (req, res) => {
        const id = parseId(req.params.id);
        const deletedCourse = await courseModel.remove(id);
        if (deletedCourse && deletedCourse.cover) {
                // __dirname is .../controllers/v1
                // ../../ goes up to the root folder, then into public/courses/covers
                const filePath = path.join(__dirname, "../../public/courses/covers", deletedCourse.cover);

                try {
                        await fs.promises.unlink(filePath);
                } catch (err) {
                        // If the file is already missing, we ignore it (err.code === 'ENOENT')
                        // Otherwise, log the error but still send a successful response
                        if (err.code !== 'ENOENT') {
                                console.error(`Failed to delete cover image at ${filePath}:`, err);
                        }
                }
        }
        res.json(found(deletedCourse, "Course"));
};

module.exports = {
        getAllCourses, getCourse, getCourseDetails, createCourse, updateCourse, deleteCourse
};