const DB = require("../configs/database");

const getCollection = async () => (await DB.getDb()).collection("notifications");

const init = async () => {
    const notifications = await getCollection();
    // Fast lookup for a user's inbox
    await notifications.createIndexes([
        { key: { user: 1, createdAt: -1 }, name: "notifications_by_user" }
    ]);
};

const create = async (data) => {
    const notifications = await getCollection();

    const notification = {
        title: data.title,
        message: data.message,
        user: data.user,
        seen: false,
        createdAt: new Date()
    };
    
    const { insertedId } = await notifications.insertOne(notification);
    return { ...notification, _id: insertedId };
};

const find = async ({ filter, sort, skip, limit }) => {
    const notifications = await getCollection();
    return notifications.find(filter).sort(sort).skip(skip).limit(limit).toArray();
};

const findById = async _id => {
    const notifications = await getCollection();
    return notifications.findOne({ _id });
};

// Note the security check inside the DB query:
// We only update if BOTH the _id and the user match!
const markAsSeen = async (_id, userId) => {
    const notifications = await getCollection();
    return notifications.findOneAndUpdate(
        { _id, user: userId },
        { $set: { seen: true, updatedAt: new Date() } },
        { returnDocument: "after" }
    );
};

module.exports = { init, create, find, findById, markAsSeen };