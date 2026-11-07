const fs = require("fs");
const path = require("path");
const sessionModel = require("../../models/Session");
const Session = require("../../src/resources/session");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");
const { ValidationError } = require("../../helpers/errors");

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
        const data = Session.parseOnly(req.body, ["title", "free", "duration"]);

        if (!req.file) {
           throw new ValidationError("Session video is required.");
        }

        console.log(req.file);
        
        data.video = req.file.filename;
        data.courseId = parseId(req.params.id);

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
        if (deletedSession && deletedSession.video) {
                // __dirname is .../controllers/v1
                // ../../ goes up to the root folder, then into public/courses/covers
                const filePath = path.join(__dirname, "../../public/courses/videos", deletedSession.video);

                try {
                        await fs.promises.unlink(filePath);
                } catch (err) {
                        // If the file is already missing, we ignore it (err.code === 'ENOENT')
                        // Otherwise, log the error but still send a successful response
                        if (err.code !== 'ENOENT') {
                                console.error(`Failed to delete cover image at ${filePath}:`, err);
                        }
                }
        }
        res.json(found(deletedSession, "Session"));
};

module.exports = {
    getAllSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
};