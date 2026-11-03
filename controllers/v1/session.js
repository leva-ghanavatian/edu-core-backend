const sessionModel = require("../../models/Session");
const Session = require("../../src/resources/session");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");

const getAllSessions = async (req, res) => {
        const { page, limit, sort, ...filterQuery } = req.query;

        const filter = Session.parseFilter(filterQuery);
        const sortObj = Session.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const sessions = await sessionModel.find({
            filter,
            sort: sortObj,
            skip,
            limit: parsedLimit
        });

        res.json(sessions);
};

const getSession = async (req, res) => {
        const id = parseId(req.params.id);
        const session = await sessionModel.findById(id);
        res.json(found(session, "Session"));
};

const createSession = async (req, res) => {
        const data = Session.parseCreate(req.body);
        const newSession = await sessionModel.create(data);
        res.status(201).json(newSession);
};

const updateSession = async (req, res) => {
        const id = parseId(req.params.id);
        const data = Session.parseUpdate(req.body);
        
        const updatedSession = await sessionModel.update(id, data);
        res.json(found(updatedSession, "Session"));
};

const deleteSession = async (req, res) => {
        const id = parseId(req.params.id);
        const deletedSession = await sessionModel.remove(id);
        res.json(found(deletedSession, "Session"));
};

module.exports = {
    getAllSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
};