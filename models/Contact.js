const DB = require("../configs/database");

const getCollection = async () => (await DB.getDb()).collection("contacts");

const init = async () => {
    const contacts = await getCollection();
    await contacts.createIndex({ status: 1, createdAt: -1 });
};

const create = async (data) => {
    const contacts = await getCollection();
    const ticket = {
        ...data,
        status: "NEW", // Default status
        createdAt: new Date()
    };
    const { insertedId } = await contacts.insertOne(ticket);
    return { ...ticket, _id: insertedId };
};

const find = async ({ filter, sort, skip, limit }) => {
    const contacts = await getCollection();
    return contacts.find(filter).sort(sort).skip(skip).limit(limit).toArray();
};

const updateStatus = async (_id, status) => {
    const contacts = await getCollection();
    return contacts.findOneAndUpdate(
        { _id },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: "after" }
    );
};

module.exports = { init, create, find, updateStatus };