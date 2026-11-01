const DB = require("../configs/database");
const { ConflictError } = require("../helpers/errors");

const getCollection = async () => (await DB.getDb()).collection("categories");


const init = async () => {
    const categories = await getCollection();
    await categories.createIndexes([
        { key: { title: 1 }, name: "unique_category_title", unique: true },
        { key: { href: 1 }, name: "unique_category_href", unique: true }
    ]);
};

const rethrowDuplicate = error => {
    if (error.code === 11000) {
        // keyPattern tells us which unique index failed
        if (error.keyPattern?.title) {
            throw new ConflictError("A category with this title already exists.");
        }
        if (error.keyPattern?.href) {
            throw new ConflictError("A category with this href already exists.");
        }
        throw new ConflictError("Category already exists.");
    }
    throw error;
};

const find = async ({ filter, sort, skip, limit }) => {
    const categories = await getCollection();
    return categories
        .find(filter)
        .sort({ ...sort, _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
};

const findById = async _id => {
    const categories = await getCollection();
    return categories.findOne({ _id });
};

const create = async ({ title, href }) => {
    const categories = await getCollection();
    const category = { 
        title, 
        href, 
        createdAt: new Date() 
    };

    try {
        const { insertedId } = await categories.insertOne(category);
        return { ...category, _id: insertedId };
    } catch (error) {
        rethrowDuplicate(error);
    }
};

const update = async (_id, changes) => {
    const categories = await getCollection();
    try {
        return await categories.findOneAndUpdate(
            { _id },
            { $set: { ...changes, updatedAt: new Date() } },
            { returnDocument: "after" }
        );
    } catch (error) {
        rethrowDuplicate(error);
    }
};

const remove = async _id => {
    const categories = await getCollection();
    return categories.findOneAndDelete({ _id });
};

module.exports = {
    init,
    find,
    findById,
    create,
    update,
    remove
};