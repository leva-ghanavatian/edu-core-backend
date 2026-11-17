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
        content: data.content,
        course: data.course,
        user: data.user,
        createdAt: new Date()
    };
    if (data.parent) comment.parent = data.parent;

    const { insertedId } = await comments.insertOne(comment);
    return { ...comment, _id: insertedId };
};
// one level deep 

// const remove = async _id => {
//     const comments = await getCollection();

//     // 1. Delete the comment
//     const deleted = await comments.findOneAndDelete({ _id });

//     // 2. Cascade Delete: If it was a main comment, delete all replies to it!
//     if (deleted) {
//         await comments.deleteMany({ parent: _id });
//     }

//     return deleted;
// };

const remove = async (id) => {
    const comments = await getCollection();
    const comment = await comments.findOne({ _id: id });
    if (!comment) return null;

    const idsToDelete = [id];
    let currentLevel = [id];

    while (currentLevel.length) {
        const children = await comments
            .find({ parent: { $in: currentLevel } }, { projection: { _id: 1 } })
            .toArray();
        currentLevel = children.map(c => c._id);
        idsToDelete.push(...currentLevel);
    }

    await comments.deleteMany({ _id: { $in: idsToDelete } });
    return comment;
};

const removeByCourse = async course => {
    const comments = await getCollection();
    return comments.deleteMany({ course });
};

// Deletes the user's comments AND every reply to them (regardless of author)
const removeByUser = async user => {
    const comments = await getCollection();
    const own = await comments
        .find({ user }, { projection: { _id: 1 } })
        .toArray();
    const ids = own.map(c => c._id);
    if (!ids.length) return { deletedCount: 0 };
    return comments.deleteMany({ $or: [{ _id: { $in: ids } }, { parent: { $in: ids } }] });
};

module.exports = { init, find, findById, create, remove, removeByCourse, removeByUser };