const categoryModel = require("../models/Category");
const Category = require("../src/resources/category");
const { parsePagination } = require("../src/parsing/pagination");
const { parseId } = require("../src/parsing/id");
const found = require("../helpers/found");

const getAllCategories = async (req, res, next) => {
    const { page, limit, sort, ...filterQuery } = req.query;

    const filter = Category.parseFilter(filterQuery);
    const sortObj = Category.parseSort(sort);
    const { skip, limit: parsedLimit } = parsePagination({ page, limit });

    const categories = await categoryModel.find({
        filter,
        sort: sortObj,
        skip,
        limit: parsedLimit
    });

    res.json(categories);
};

const getCategory = async (req, res, next) => {
    const id = parseId(req.params.id);
    const category = await categoryModel.findById(id);
    res.json(found(category, "Category"));
};

const createCategory = async (req, res, next) => {
    const data = Category.parseCreate(req.body);
    const newCategory = await categoryModel.create(data);
    res.status(201).json(newCategory);
};

const updateCategory = async (req, res, next) => {
    const id = parseId(req.params.id);
    const data = Category.parseUpdate(req.body);
    const updatedCategory = await categoryModel.update(id, data);
    res.json(found(updatedCategory, "Category"));
};

const deleteCategory = async (req, res, next) => {
    const id = parseId(req.params.id);
    const deletedCategory = await categoryModel.remove(id);
    res.json(found(deletedCategory, "Category"));
};

module.exports = {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
};