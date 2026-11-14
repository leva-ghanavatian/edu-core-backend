const DB = require("../configs/database");
const { ConflictError } = require("../helpers/errors");

const getCollection = async () => (await DB.getDb()).collection("offs");

const init = async () => {
    const offs = await getCollection();
    // A course cannot have duplicate codes, but different courses can have the same code (e.g., "SUMMER")
    await offs.createIndexes([
        { key: { code: 1, course: 1 }, name: "unique_off_per_course", unique: true }
    ]);
};

const rethrowDuplicate = error => {
    if (error.code === 11000) {
        throw new ConflictError("This discount code already exists for this course.");
    }
    throw error;
};

const create = async ({ code, percent, course, max, creator }) => {
    const offs = await getCollection();
    const off = {
        code,
        percent,
        course,
        max,
        creator,
        uses: 0,
        createdAt: new Date()
    };

    try {
        const { insertedId } = await offs.insertOne(off);
        return { ...off, _id: insertedId };
    } catch (error) {
        rethrowDuplicate(error);
    }
};

const findByCourse = async (courseId) => {
    const offs = await getCollection();
    return offs.find({ course: courseId }).toArray();
};

// READ-ONLY: Just check if it's valid and return the discount
const validateCode = async (courseId, code) => {
    const offs = await getCollection();
    
    // Find the code and ensure it still has uses left
    return offs.findOne({ 
        course: courseId, 
        code: code.toUpperCase(),
        $expr: { $lt: ["$uses", "$max"] } 
    });
};

// 2. WRITE: Atomically consume the code (Increment uses)
// This should ONLY be called during the actual purchase/enrollment process.
const consumeCode = async (courseId, code) => {
    const offs = await getCollection();
    
    // The $expr guarantees we don't go over the limit, even if 10 people buy at once
    return offs.findOneAndUpdate(
        { 
            course: courseId, 
            code: code.toUpperCase(),
            $expr: { $lt: ["$uses", "$max"] } 
        },
        { $inc: { uses: 1 } }, 
        { returnDocument: "after" }
    );
};

const remove = async _id => {
    const offs = await getCollection();
    return offs.findOneAndDelete({ _id });
};

module.exports = { init, create, findByCourse, validateCode, consumeCode, remove };