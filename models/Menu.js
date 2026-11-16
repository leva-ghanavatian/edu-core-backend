const DB = require("../configs/database");

const getCollection = async () => (await DB.getDb()).collection("menus");

const init = async () => {
    const menus = await getCollection();
    // Index parent for fast tree building
    await menus.createIndex({ parent: 1 });
};

const create = async (data) => {
    const menus = await getCollection();

    const menu = {
        title: data.title,
        href: data.href,
        createdAt: new Date()
    };
    if (data.parent) menu.parent = data.parent;

    const { insertedId } = await menus.insertOne(menu);
    return { ...menu, _id: insertedId };
};

// 1. Fetch flat list (for the public tree builder)
const find = async ({ filter, sort, skip, limit }) => {
    const menus = await getCollection();
    return menus.find(filter).sort(sort).skip(skip).limit(limit).toArray();
};

// 2. Fetch with populated parent (for the Admin panel)
const findWithPopulate = async ({ filter, sort, skip, limit }) => {
    const menus = await getCollection();
    return menus.aggregate([
        { $match: filter },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: "menus",         // Self-join!
                localField: "parent",
                foreignField: "_id",
                as: "parent"
            }
        },
        // Flatten the parent array into a single object
        { $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } }
    ]).toArray();
};

const remove = async _id => {
    const menus = await getCollection();
    // 1. Delete the menu
    const deleted = await menus.findOneAndDelete({ _id });
    // 2. Cascade Delete: Remove any submenus that belonged to it
    if (deleted) {
        await menus.deleteMany({ parent: _id });
    }
    return deleted;
};

module.exports = { init, create, find, findWithPopulate, remove };