const courseModel = require("../../models/Course");
const Course = require("../../src/resources/course");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");

const getAllCourses = async (req, res, next) => {
        const { page, limit, sort, ...filterQuery } = req.query;

        const filter = Course.parseFilter(filterQuery);
        const sortObj = Course.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const courses = await courseModel.find({
            filter, sort: sortObj, skip, limit: parsedLimit
        });

        res.json(courses);
};

const getCourse = async (req, res, next) => {
        const id = parseId(req.params.id);
        const course = await courseModel.findById(id);
        res.json(found(course, "Course"));
};

const getCourseDetails = async (req, res) => {
        const id = parseId(req.params.id);
        const course = await courseModel.findWithDetails(id);
        res.json(found(course, "Course"));
};

const createCourse = async (req, res) => {
        const data = Course.parseCreate(req.body);
        
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
        res.json(found(deletedCourse, "Course"));
};

module.exports = {
    getAllCourses, getCourse, getCourseDetails, createCourse, updateCourse, deleteCourse
};