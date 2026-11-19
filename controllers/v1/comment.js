const commentModel = require("../../models/Comment");
const Comment = require("../../src/resources/comment");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");
const { buildCommentTree } = require("../../src/core/utils");
const { ForbiddenError } = require("../../helpers/errors");

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

// this is for fetching all the comments for a course without pagination

// const getCourseComments = async (req, res, next) => {
//     try {
//         const { courseId } = req.params;

//         // 1. Fetch the flat array from the database
//         const flatComments = await commentModel.find({ 
//             filter: { course: parseId(courseId) },
//             sort: { createdAt: -1 }, // Newest first
//             skip: 0, 
//             limit: 1000 // (See pagination below)
//         });

//         // 2. Transform it into a nested tree
//         const commentTree = buildCommentTree(flatComments);

//         // 3. Send the nested tree to the frontend
//         res.json(commentTree);
//     } catch (error) { 
//         next(error); 
//     }
// };

const getCourseComments = async (req, res, next) => {
        try {
                const courseId = parseId(req.params.id);
                const { page, limit } = req.query;
                const { skip, limit: parsedLimit } = parsePagination({ page, limit });

                // 1. Get Top-Level Comments (Paginated)
                const rootComments = await commentModel.findWithUser({
                        filter: { course: courseId, parent: null },
                        sort: { createdAt: -1 },
                        skip,
                        limit: parsedLimit
                });

                if (rootComments.length === 0) return res.json([]);

                // 2. Get the IDs of those root comments
                const rootIds = rootComments.map(c => c._id);

                // 3. Fetch ALL replies that belong to those root comments
                const replies = await commentModel.findWithUser({
                        filter: { parent: { $in: rootIds } },
                        sort: { createdAt: 1 }, // Replies usually oldest first
                        skip: 0,
                        limit: 5000 // Fetch all replies for these specific parents
                });

                // 4. Combine them into one flat array
                const allComments = [...rootComments, ...replies];


                //  Build the tree!
                const commentTree = buildCommentTree(allComments);

                res.json(commentTree);
        } catch (error) { next(error); }
};

const createComment = async (req, res) => {
        const data = Comment.parseOnly(req.body, ["content", "parent"]);
        data.course = parseId(req.params.id);
        data.user = parseId(req.user.sub);

        if (!data.parent) delete data.parent;

        const newComment = await commentModel.create(data);
        res.status(201).json(newComment);
};

const deleteComment = async (req, res) => {
        const id = parseId(req.params.id);
        const userId = parseId(req.user.sub);

        const comment = await commentModel.findById(id);
        found(comment, "Comment");

        //  Authorization — owner or admin
        const isOwner = comment.user?.equals(userId);
        const isAdmin = req.user.role === "ADMIN";
        if (!isOwner && !isAdmin) {
                throw new ForbiddenError("You can only delete your own comments.");
        }

        //  Delete (cascades replies)
        const deletedComment = await commentModel.remove(id);
        res.json(found(deletedComment, "Comment"));
};

module.exports = { getAllComments, getCourseComments, createComment, deleteComment };