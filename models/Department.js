const DB = require("../configs/database");
const { ConflictError } = require("../helpers/errors");

const getCollection = async () => (await DB.getDb()).collection("departments");

const init = async () => {
    const departments = await getCollection();
    await departments.createIndex({ title: 1 }, { unique: true });
};

const rethrowDuplicate = error => {
    if (error.code === 11000) throw new ConflictError("This department already exists.");
    throw error;
};

const create = async ({ title }) => {
    const departments = await getCollection();
    const dept = { title, createdAt: new Date() };
    try {
        const { insertedId } = await departments.insertOne(dept);
        return { ...dept, _id: insertedId };
    } catch (error) { rethrowDuplicate(error); }
};

const find = async ({ filter, sort, skip, limit }) => {
    const departments = await getCollection();
    return departments.find(filter).sort(sort).skip(skip).limit(limit).toArray();
};

const findById = async _id => {
    const departments = await getCollection();
    return departments.findOne({ _id });
};

const remove = async _id => {
    const departments = await getCollection();
    return departments.findOneAndDelete({ _id });
};

module.exports = { init, create, find, findById, remove };