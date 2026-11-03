const commentModel = require("../../models/Comment");
const Comment = require("../../src/resources/comment");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");

const getAllComments = async (req, res) => {
        const { page, limit, sort, ...filterQuery } = req.query;

        const filter = Comment.parseFilter(filterQuery);
        const sortObj = Comment.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const comments = await commentModel.find({
            filter,
            sort: sortObj,
            skip,
            limit: parsedLimit
        });

        res.json(comments);
};

const createComment = async (req, res, next) => {
    try {
        const data = Comment.parseOnly(req.body, ["content", "course", "parent"]);
        
        data.user = parseId(req.user.sub); 
        
        if (!data.parent) delete data.parent;

        const newComment = await commentModel.create(data);
        res.status(201).json(newComment);
    } catch (error) { next(error); }
};

const deleteComment = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const deletedComment = await commentModel.remove(id);
        res.json(found(deletedComment, "Comment"));
    } catch (error) { next(error); }
};

module.exports = { getAllComments, createComment, deleteComment };