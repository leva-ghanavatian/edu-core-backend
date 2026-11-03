const DB = require("../configs/database");
const { ConflictError } = require("../helpers/errors");

const getCollection = async () => (await DB.getDb()).collection("courses");

const init = async () => {
    const courses = await getCollection();
    await courses.createIndexes([
        { key: { href: 1 }, name: "unique_course_href", unique: true },
        { key: { category: 1 }, name: "courses_by_category" },
        { key: { creator: 1 }, name: "courses_by_creator" }
    ]);
};

const rethrowDuplicate = error => {
    if (error.code === 11000) {
        throw new ConflictError("A course with this href already exists.");
    }
    throw error;
};

const find = async ({ filter, sort, skip, limit }) => {
    const courses = await getCollection();
    return courses
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
};

const findById = async _id => {
    const courses = await getCollection();
    return courses.findOne({ _id });
};

const create = async (data) => {
    const courses = await getCollection();
    const course = {
        ...data,
        createdAt: new Date()
    };
    try {
        const { insertedId } = await courses.insertOne(course);
        return { ...course, _id: insertedId };
    } catch (error) {
        rethrowDuplicate(error);
    }
};

const update = async (_id, changes) => {
    const courses = await getCollection();
    try {
        return await courses.findOneAndUpdate(
            { _id },
            { $set: { ...changes, updatedAt: new Date() } },
            { returnDocument: "after" }
        );
    } catch (error) {
        rethrowDuplicate(error);
    }
};

const remove = async _id => {
    const courses = await getCollection();
    return courses.findOneAndDelete({ _id });
};

const findWithDetails = async _id => {
    const courses = await getCollection();
    return courses.aggregate([
        { $match: { _id } },
        {
            $lookup: {
                from: "sessions",
                localField: "_id",
                foreignField: "course",
                as: "sessions"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "course",
                as: "comments"
            }
        }
    ]).next();
};

module.exports = { init, find, findById, create, update, remove, findWithDetails };