const DB = require("../configs/database");

const getCollection = async () => (await DB.getDb()).collection("comments");

const init = async () => {
    const comments = await getCollection();
    await comments.createIndexes([
        { key: { course: 1, createdAt: -1 }, name: "comments_by_course" },
        { key: { parent: 1 }, name: "replies_by_parent" }
    ]);
};

const find = async ({ filter, sort, skip, limit }) => {
    const comments = await getCollection();
    return comments
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
};

const findById = async _id => {
    const comments = await getCollection();
    return comments.findOne({ _id });
};

const create = async (data) => {
    const comments = await getCollection();
    const comment = {
        ...data,
        createdAt: new Date()
    };
    const { insertedId } = await comments.insertOne(comment);
    return { ...comment, _id: insertedId };
};

const remove = async _id => {
    const comments = await getCollection();
    
    // 1. Delete the comment
    const deleted = await comments.findOneAndDelete({ _id });
    
    // 2. Cascade Delete: If it was a main comment, delete all replies to it!
    if (deleted) {
        await comments.deleteMany({ parent: _id });
    }
    
    return deleted;
};

module.exports = { init, find, create, remove };