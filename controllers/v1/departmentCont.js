const departmentModel = require("../../models/Department");
const subDepartmentModel = require("../../models/SubDepartment");
const Department = require("../../src/resources/department");
const SubDepartment = require("../../src/resources/subDepartment");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");

// --- Main Departments ---

const createDepartment = async (req, res, next) => {
    try {
        const data = Department.parseCreate(req.body);
        const newDept = await departmentModel.create(data);
        res.status(201).json(newDept);
    } catch (error) { next(error); }
};

const getAllDepartments = async (req, res, next) => {
    try {
        const { page, limit, sort, ...filterQuery } = req.query;
        const filter = Department.parseFilter(filterQuery);
        const sortObj = Department.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const depts = await departmentModel.find({ filter, sort: sortObj, skip, limit: parsedLimit });
        res.json(depts);
    } catch (error) { next(error); }
};

const deleteDepartment = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const deleted = await departmentModel.remove(id);
        // Optional: You should also delete all sub-departments belonging to this department!
        res.json(found(deleted, "Department"));
    } catch (error) { next(error); }
};

// --- Sub Departments ---

const createSubDepartment = async (req, res, next) => {
    try {
        // Note: You can inject parent ID from params if the route is /departments/:id/subs
        const data = SubDepartment.parseCreate(req.body);
        const newSub = await subDepartmentModel.create(data);
        res.status(201).json(newSub);
    } catch (error) { next(error); }
};

const getSubDepartments = async (req, res, next) => {
    try {
        // Force the filter to only look for subs belonging to the parent in the URL
        const parentId = parseId(req.params.id);
        const { page, limit, sort, ...filterQuery } = req.query;
        
        const filter = SubDepartment.parseFilter({ ...filterQuery, parent: parentId });
        const sortObj = SubDepartment.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const subs = await subDepartmentModel.find({ filter, sort: sortObj, skip, limit: parsedLimit });
        res.json(subs);
    } catch (error) { next(error); }
};

module.exports = {
    createDepartment, getAllDepartments, deleteDepartment,
    createSubDepartment, getSubDepartments
};