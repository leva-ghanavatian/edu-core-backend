const DB = require("../configs/database");

const getCollection = async () => (await DB.getDb()).collection("contacts");

const init = async () => {
    const contacts = await getCollection();
    await contacts.createIndex({ status: 1, createdAt: -1 });
};

const findById = async _id => {
    const contacts = await getCollection();
    return contacts.findOne({ _id });
};

const create = async (data) => {
    const contacts = await getCollection();
    const ticket = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: "NEW",
        createdAt: new Date()
    };
    if (data.phone) ticket.phone = data.phone;
    if (data.attachment) ticket.attachment = data.attachment;

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

module.exports = { findById, init, create, find, updateStatus };