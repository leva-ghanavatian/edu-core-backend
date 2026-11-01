const DB = require("../configs/database");
const { ConflictError } = require("../helpers/errors");

const getCollection = async () => (await DB.getDb()).collection("banned");

const init = async () => {
    const banned = await getCollection();
    await banned.createIndex({ phone: 1 }, { unique: true });
};

const create = async ({ phone }) => {
    const banned = await getCollection();
    const bannedUserPhone = { phone, bannedAt: new Date() };
    try {
        const { insertedId } = await banned.insertOne(bannedUserPhone);
        return { ...bannedUserPhone, _id: insertedId };
    } catch (error) {
        if (error.code === 11000) {
            throw new ConflictError("This phone number is already banned.");
        }
        throw error;
    }
};

const findByPhone = async phone => {
    const banned = await getCollection();
    return banned.findOne({ phone });
};

const deletePhone = async id => {
    const banned = await getCollection();
    return banned.findOneAndDelete({ _id: id });
}

module.exports = { init, create, findByPhone, deletePhone };