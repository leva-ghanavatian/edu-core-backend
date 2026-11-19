const DB = require("../configs/database");
const { ConflictError } = require("../helpers/errors");

const getCollection = async () => (await DB.getDb()).collection("sub_departments");

const init = async () => {
    const subs = await getCollection();
    // Fast lookup for: "Get all sub-departments for Department X"
    await subs.createIndex({ parent: 1 }); 
    // Prevent duplicate sub-departments inside the same parent
    await subs.createIndex({ parent: 1, title: 1 }, { unique: true }); 
};

const rethrowDuplicate = error => {
    if (error.code === 11000) throw new ConflictError("This sub-department already exists in this department.");
    throw error;
};

const create = async ({ title, parent }) => {
    const subs = await getCollection();
    const subDept = { title, parent, createdAt: new Date() };
    try {
        const { insertedId } = await subs.insertOne(subDept);
        return { ...subDept, _id: insertedId };
    } catch (error) { rethrowDuplicate(error); }
};

const find = async ({ filter, sort, skip, limit }) => {
    const subs = await getCollection();
    return subs.find(filter).sort(sort).skip(skip).limit(limit).toArray();
};

const findById = async _id => {
    const subs = await getCollection();
    return subs.findOne({ _id });
};

const remove = async _id => {
    const subs = await getCollection();
    return subs.findOneAndDelete({ _id });
};

module.exports = { init, create, find, findById, remove };