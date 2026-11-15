const DB = require("../configs/database");

const getCollection = async () => (await DB.getDb()).collection("tickets");

const init = async () => {
    const tickets = await getCollection();
    await tickets.createIndexes([
        { key: { user: 1, createdAt: -1 }, name: "tickets_by_user" },
        { key: { answered: 1, createdAt: -1 }, name: "unanswered_tickets" },
        { key: { parent: 1 }, name: "ticket_answers" }
    ]);
};

const create = async (data) => {
    const tickets = await getCollection();
    const ticket = {
        ...data,
        createdAt: new Date()
    };
    const { insertedId } = await tickets.insertOne(ticket);
    return { ...ticket, _id: insertedId };
};

// Fetch list with populated fields ($lookup)
const findWithPopulate = async ({ filter, sort, skip, limit }) => {
    const tickets = await getCollection();
    return tickets.aggregate([
        { $match: filter },
        { $sort: { ...sort, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
        // Populate Department
        { $lookup: { from: "departments", localField: "departmentID", foreignField: "_id", as: "department" } },
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
        // Populate SubDepartment
        { $lookup: { from: "sub_departments", localField: "departmentSubID", foreignField: "_id", as: "subDepartment" } },
        { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },
        // Populate User
        { $lookup: { from: "users", localField: "user", foreignField: "_id", pipeline: [{ $project: { passwordHash: 0 } }], as: "user" } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }
    ]).toArray();
};

const getTicketAndAnswer = async (ticketId) => {
    const tickets = await getCollection();
    // 1. Get the main ticket
    const ticket = await tickets.findOne({ _id: ticketId });
    // 2. Get the answer (where parent === ticketId)
    const answer = await tickets.findOne({ parent: ticketId });
    return { ticket, answer };
};

const setAnswered = async (ticketId) => {
    const tickets = await getCollection();
    return tickets.findOneAndUpdate(
        { _id: ticketId },
        { $set: { answered: 1 } },
        { returnDocument: "after" }
    );
};

module.exports = { init, create, findWithPopulate, getTicketAndAnswer, setAnswered };