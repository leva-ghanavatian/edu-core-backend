const DB = require("../configs/database");
const { ConflictError } = require("../helpers/errors");

const getCollection = async () => (await DB.getDb()).collection("sessions");

const init = async () => {
    const sessions = await getCollection();
    await sessions.createIndexes([
        { key: { course: 1 }, name: "sessions_by_course" },
        { key: { course: 1, title: 1 }, name: "unique_session_per_course", unique: true }
    ]);
};

const rethrowDuplicate = error => {
    if (error.code === 11000) {
        throw new ConflictError("A session with this title already exists in this course.");
    }
    throw error;
};

const find = async ({ filter, sort, skip, limit }) => {
    const sessions = await getCollection();
    return sessions
        .find(filter)
        .sort({ ...sort, _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
};

const findById = async _id => {
    const sessions = await getCollection();
    return sessions.findOne({ _id });
};

const create = async ({ title, duration, free, video, courseId }) => {
    const sessions = await getCollection();
    const session = {
        title,
        duration,
        free,
        video,
        courseId,
        createdAt: new Date()
    };

    try {
        const { insertedId } = await sessions.insertOne(session);
        return { ...session, _id: insertedId };
    } catch (error) {
        rethrowDuplicate(error);
    }
};

const update = async (_id, changes) => {
    const sessions = await getCollection();
    try {
        return await sessions.findOneAndUpdate(
            { _id },
            { $set: { ...changes, updatedAt: new Date() } },
            { returnDocument: "after" }
        );
    } catch (error) {
        rethrowDuplicate(error);
    }
};

const remove = async _id => {
    const sessions = await getCollection();
    return sessions.findOneAndDelete({ _id });
};

module.exports = {
    init,
    find,
    findById,
    create,
    update,
    remove
};