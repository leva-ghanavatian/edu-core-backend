const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const client = new MongoClient(process.env.MONGO_URL);
const dbName = process.env.dbName;

let dbPromise = null;

const getDb = () => {
    dbPromise ??= client.connect()
    .then(() => {
        console.log("Connected to MongoDB successfully.");
        return client.db(dbName);
    }).catch((err) => {
        dbPromise = null;
        throw err;
    });
    return dbPromise;
};

const closeConnection = async () => {
    await client.close();
    console.log("MongoDB connection closed.");
};

module.exports = {
    getDb,
    closeConnection,
};